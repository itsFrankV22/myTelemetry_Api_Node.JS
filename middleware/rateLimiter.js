import rateLimit from 'express-rate-limit';
import chalk from 'chalk';
import { logRequest } from '../utils/log.js';

const blockedIps = new Map();

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { message: '❌ TOO MANY ATTEMPTS!' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        const clientIp = req.ip.replace('::ffff:', '');
        if (!blockedIps.has(clientIp)) {
            blockedIps.set(clientIp, true);
            logRequest(
                'RateLimit',
                `IP: ${clientIp} has been blocked for exceeding the request limit.`,
                chalk.red
            );
            setTimeout(() => {
                blockedIps.delete(clientIp);
                logRequest(
                    'RateLimit',
                    `IP: ${clientIp} has been removed from the block and can make requests again.`,
                    chalk.green
                );
            }, 5 * 60 * 1000);
        }
        res.status(options.statusCode).send(options.message);
    },
    skipFailedRequests: false,
});