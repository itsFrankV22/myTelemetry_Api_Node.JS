import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { DATA_FOLDER } from '../config.js';

const LOGS_FOLDER = path.join(DATA_FOLDER, 'ConsoleLogs');

function ensurePluginLogFolder(pluginName) {
    const pluginFolder = path.join(LOGS_FOLDER, pluginName);
    if (!fs.existsSync(pluginFolder)) {
        fs.mkdirSync(pluginFolder, { recursive: true });
    }
    return pluginFolder;
}

function getLogFilePath(pluginName) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(ensurePluginLogFolder(pluginName), `console-${today}.log`);
}

export function checkAndRotateLog(pluginName) {
    // La rotación ahora se basa en la fecha del archivo, por lo que solo uno por día
    // No necesitas renombrar nada, solo cada día el log es otro archivo
    ensurePluginLogFolder(pluginName);
}

export function logRequest(typeInfo, details, color = chalk.white, showTimestamp = true, pluginName = 'global') {
    checkAndRotateLog(pluginName);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: true });
    const logMessage = showTimestamp
        ? `[ ${timestamp} ] ${typeInfo}: ${details}`
        : `${typeInfo}: ${details}`;
    const logFile = getLogFilePath(pluginName);
    fs.appendFileSync(logFile, stripAnsi(`${logMessage}\n`));
    console.log(color(logMessage));
}