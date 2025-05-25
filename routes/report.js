import express from 'express';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { logPluginReport } from '../utils/reportLogger.js';
import { formatTime } from '../utils/formatTime.js';

const SERVER_REPORTS_PATH = path.join(process.cwd(), 'DataFiles', 'ServerReports');
const router = express.Router();

function sanitizeName(str) {
  return String(str).replace(/[^a-zA-Z0-9_\-:.]/g, "_");
}

function colorLabel(label) {
  return chalk.bold.cyan(label);
}
function colorValue(value) {
  return chalk.whiteBright(value);
}
function plainSeparator() {
  return '-'.repeat(58);
}

function separatorWithTime(now) {
  const width = 58;
  const cubaTime = `[${formatTime(now)}]`;
  const totalPad = width - cubaTime.length;
  const padLeft = Math.floor(totalPad / 2);
  const padRight = totalPad - padLeft;
  return chalk.bgBlueBright.black('-'.repeat(padLeft) + cubaTime + '-'.repeat(padRight));
}

function centeredTitle(text) {
  const width = 58;
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return chalk.bgMagentaBright(' '.repeat(pad) + text + ' '.repeat(width - text.length - pad));
}
function formatTableRow(key, value) {
  return colorLabel(key.padEnd(15)) + ': ' + colorValue(value);
}
function formatErrorSection(message, stack, width) {
  const rows = [];
  rows.push(chalk.bgRed.white.bold(' ERROR ').padEnd(width, ' '));
  rows.push(chalk.redBright('Mensaje: ') + chalk.white(message));
  if (stack && stack.trim()) {
    rows.push(chalk.redBright('Stack:'));
    rows.push(chalk.gray(stack));
  }
  return rows;
}

router.post('/report', (req, res) => {
    const report = req.body;

    const ip = (report.publicIp || 'N_A').replace(/[^0-9.:]/g, '');
    const port = `${report.port || 'N_A'}`;
    const name = sanitizeName(report.nameParameter || 'N_A');
    const pluginNameForLog = (report.plugin || 'unknown_plugin').replace(/[^a-zA-Z0-9_\-]/g, '_');

    const folderName = `${ip}_${port}_${name}`;
    const folderPath = path.join(SERVER_REPORTS_PATH, folderName);

    fs.mkdirSync(folderPath, { recursive: true });

    const fileName = `${new Date().toISOString().replace(/[:.]/g, '_')}.json`;
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');

    const now = new Date();

    const importantRows = [
        formatTableRow('PLUGIN', report.plugin || 'N/A'),
        formatTableRow('VERSION', report.pluginVersion || 'N/A'),
        formatTableRow('AUTHOR', report.pluginAuthor || 'N/A'),
        formatTableRow('PORT', report.port || 'N/A'),
        formatTableRow('SERVER', report.serverName || 'N/A'),
        formatTableRow('PUBLIC IP', report.publicIp || 'N/A'),
        formatTableRow('WORLD FILE', report.world || 'N/A'),
        formatTableRow('PLAYERS', `${report.currPlayers ?? 'N/A'} / ${report.maxPlayers ?? 'N/A'}`),
    ];
    const moreRows = [
        formatTableRow('TSHOCK', report.tshockVersion || 'N/A'),
        formatTableRow('TERRARIA', report.terrariaVersion || 'N/A'),
        formatTableRow('OS', report.serverOs || 'N/A'),
        formatTableRow('MACHINE', report.machineName || 'N/A'),
        formatTableRow('ARCH', report.processArch || 'N/A'),
        formatTableRow('USER', report.processUser || 'N/A'),
        formatTableRow('DOTNET', report.dotnetVersion || 'N/A'),
        formatTableRow('WORLD SEED', report.worldSeed || 'N/A'),
        formatTableRow('WORLD SIZE', report.worldSize || 'N/A'),
        formatTableRow('WORLD ID', report.worldId || 'N/A'),
        formatTableRow('LOCAL IP', report.localIp || 'N/A'),
        formatTableRow('DESCRIPTION', report.pluginDescription || 'N/A'),
        formatTableRow('BUILD DATE', report.pluginBuildDate || 'N/A'),
        formatTableRow('UA', report.userAgent || 'N/A')
    ];

    const errorSection = formatErrorSection(report.message || 'N/A', report.stackTrace || '', 58);

    const tableLines = [
        separatorWithTime(now),
        centeredTitle('reporte de error de plugin'),
        plainSeparator(),
        ...importantRows,
        plainSeparator(),
        ...moreRows,
        plainSeparator(),
        '',
        ...errorSection,
        '',
        plainSeparator(),
        ''
    ];

    console.log(tableLines.join('\n'));

    logPluginReport(pluginNameForLog, tableLines.join('\n'));

    res.status(200).json({ ok: true, path: filePath });
});

export default router;