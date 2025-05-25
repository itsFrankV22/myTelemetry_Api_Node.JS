import express from 'express';
import session from 'express-session';
import http from 'http';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

// Mid
import { limiter } from './middleware/rateLimiter.js';

// Routes
import initializeRoute from './routes/initialize.js';
import reportRoute from './routes/report.js';
import validateRoute from './routes/validate.js'

import { startConsoleCommands } from './commands.js';

// Configs
const BASE_PATH = path.dirname(fileURLToPath(import.meta.url));
import { PORT } from './config.js';
import { SECRET_KEY } from './config.js';

const app = express();
app.use(express.json());
app.use(express.static(path.join(BASE_PATH, 'public')));

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(limiter);

// using routes
app.use(initializeRoute);
app.use(reportRoute);
app.use(validateRoute);

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(chalk.green(`>> 🌐 http://localhost:${PORT}`));
});

// Console
startConsoleCommands();