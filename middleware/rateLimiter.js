import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const RATE_LIMIT_DB_PATH = path.join(process.cwd(), 'DataFiles', 'RateLimiterDB.json');
const LOG_FILE_PATH = path.join(process.cwd(), 'DataFiles', 'ConsoleLogs', 'rateLimiter.log');

// In-memory blocked IPs data:
// {
//   "ip1": { blockedAt: timestamp, permanent: bool, expiresAt: timestamp|null, attempts: number, loggedBlockedRequest: bool },
//   ...
// }
let blockedIps = {};

// Configurable parameters
const TEMP_BLOCK_TIME = 5 * 60 * 1000;   // 5 minutes block for temp
const MAX_REQUESTS_DURING_TEMP_BLOCK = 10; // 10 requests while temp blocked to become permanent

// Get current timestamp formatted (YYYY-MM-DD HH:mm:ss)
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Save blockedIps object to JSON file (pretty)
function saveBlockedIps() {
  try {
    fs.writeFileSync(RATE_LIMIT_DB_PATH, JSON.stringify(blockedIps, null, 2), 'utf-8');
  } catch (err) {
    console.error(chalk.red(`[RateLimiter][Error] Could not save DB: ${err.message}`));
  }
}

// Load blockedIps from JSON file or create empty object
function loadBlockedIps() {
  try {
    if (!fs.existsSync(RATE_LIMIT_DB_PATH)) {
      fs.writeFileSync(RATE_LIMIT_DB_PATH, '{}', 'utf-8');
      blockedIps = {};
      return;
    }
    const data = fs.readFileSync(RATE_LIMIT_DB_PATH, 'utf-8');
    blockedIps = JSON.parse(data);
  } catch (err) {
    console.error(chalk.red(`[RateLimiter][Error] Could not load DB: ${err.message}`));
    blockedIps = {};
  }
}

// Remove expired temporary blocks
function cleanExpiredBlocks() {
  const now = Date.now();
  let changed = false;

  for (const [ip, info] of Object.entries(blockedIps)) {
    if (!info.permanent && info.expiresAt && info.expiresAt <= now) {
      delete blockedIps[ip];
      writeLog('RateLimit', `IP: ${ip} automatically unblocked after temp block expired.`, chalk.green);
      changed = true;
    }
  }

  if (changed) saveBlockedIps();
}

// Write message to log file and console (colored)
function writeLog(type, message, colorFn = (txt) => txt) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;

  fs.appendFile(LOG_FILE_PATH, logMessage, (err) => {
    if (err) {
      console.error(chalk.red(`[RateLimiter][Error] Could not write to log: ${err.message}`));
    }
  });

  console.log(colorFn(`[${type}] ${message}`));
}

// Block an IP: permanent or temporary
function blockIp(ip, permanent = false, cooldownMs = TEMP_BLOCK_TIME) {
  const now = Date.now();

  if (!blockedIps[ip]) {
    blockedIps[ip] = {
      blockedAt: now,
      permanent,
      expiresAt: permanent ? null : now + cooldownMs,
      tempBlockRequests: 0,
      loggedBlockedRequest: false,
    };
  } else {
    if (permanent) {
      blockedIps[ip].permanent = true;
      blockedIps[ip].expiresAt = null;
    } else {
      // Re-blocking temporarily: reset counter of requests during block
      blockedIps[ip].blockedAt = now;
      blockedIps[ip].expiresAt = now + cooldownMs;
      blockedIps[ip].tempBlockRequests = 0;
      blockedIps[ip].loggedBlockedRequest = false;
    }
  }

  saveBlockedIps();

  if (permanent) {
    writeLog('RateLimit', `IP: ${ip} blocked PERMANENTLY.`, chalk.red);
  } else {
    writeLog('RateLimit', `IP: ${ip} temporarily blocked for exceeding rate limit.`, chalk.red);
  }

  if (!permanent) {
    setTimeout(() => {
      if (blockedIps[ip] && !blockedIps[ip].permanent) {
        delete blockedIps[ip];
        saveBlockedIps();
        writeLog('RateLimit', `IP: ${ip} unblocked after temp cooldown.`, chalk.green);
      }
    }, cooldownMs);
  }

  saveBlockedIps();

  // Log temporary or permanent block only on first block (avoid duplicates)
  if (permanent) {
    writeLog('RateLimit', `IP: ${ip} blocked PERMANENTLY.`, chalk.red);
  } else if (blockedIps[ip].attempts === 1) {
    writeLog('RateLimit', `IP: ${ip} temporarily blocked for exceeding rate limit.`, chalk.red);
  }

  // Schedule automatic unblock for temporary blocks if not permanent
  if (!permanent) {
    setTimeout(() => {
      // If still blocked and not permanent, unblock
      if (blockedIps[ip] && !blockedIps[ip].permanent) {
        delete blockedIps[ip];
        saveBlockedIps();
        writeLog('RateLimit', `IP: ${ip} unblocked after temp cooldown.`, chalk.green);
      }
    }, cooldownMs);
  }
}

// Check if IP is currently blocked
function isBlocked(ip) {
  const info = blockedIps[ip];
  if (!info) return false;
  if (info.permanent) return true;
  if (info.expiresAt && info.expiresAt > Date.now()) return true;
  return false;
}

// Initialize DB and cleanup expired blocks on startup
loadBlockedIps();
cleanExpiredBlocks();

// Export the rate limiter middleware
export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: { message: '❌ TOO MANY ATTEMPTS!' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip.replace('::ffff:', '');

    if (isBlocked(clientIp)) {
      const info = blockedIps[clientIp];

      if (info && !info.permanent) {
        // Increment requests during temporary block
        info.tempBlockRequests = (info.tempBlockRequests || 0) + 1;

        if (info.tempBlockRequests >= MAX_REQUESTS_DURING_TEMP_BLOCK) {
          // Promote to permanent
          info.permanent = true;
          info.expiresAt = null;
          writeLog('RateLimit', `IP: ${clientIp} blocked PERMANENTLY after ${MAX_REQUESTS_DURING_TEMP_BLOCK} requests during temp block.`, chalk.red);
        }
        saveBlockedIps();
      }

      if (info && !info.loggedBlockedRequest) {
        writeLog('RateLimit', `Blocked request from IP: ${clientIp}`, chalk.yellow);
        info.loggedBlockedRequest = true;
        saveBlockedIps();
      }

      return res.status(429).send({ message: '❌ TOO MANY ATTEMPTS!' });
    }

    // Not blocked yet, block temporarily on limit exceeded
    blockIp(clientIp, false);
    return res.status(429).send({ message: '❌ TOO MANY ATTEMPTS!' });
  },
  skipFailedRequests: false,
});
