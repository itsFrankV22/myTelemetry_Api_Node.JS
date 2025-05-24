import express from 'express';
import session from 'express-session';
import http from 'http';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

import { limiter } from './middleware/rateLimiter.js';
import { logRequest } from './utils/log.js';

import initializeRoute from './routes/initialize.js';
import reportRoute from './routes/report.js';

import { startConsoleCommands } from './commands.js';

// Paths y configuración
const BASE_PATH = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8121;

const app = express();
app.use(express.json());
app.use(express.static(path.join(BASE_PATH, 'public')));

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(limiter);

// Rutas principales
app.use(initializeRoute);
app.use(reportRoute);

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(chalk.green(`🌐 Servidor iniciado en http://localhost:${PORT}`));
});

// Iniciar consola interactiva
startConsoleCommands();