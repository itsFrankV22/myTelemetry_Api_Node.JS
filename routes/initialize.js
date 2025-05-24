import express from 'express';
import chalk from 'chalk';
import { logRequest } from '../utils/log.js';

const router = express.Router();

function colorLabel(label) {
    // Elige colores diferentes para los labels principales
    switch (label.trim()) {
        case 'PLUGIN': return chalk.cyan(label);
        case 'VERSION': return chalk.yellow(label);
        case 'AUTHOR': return chalk.magenta(label);
        case 'PORT': return chalk.green(label);
        case 'VALIDATED': return chalk.blue(label);
        case 'SERVER': return chalk.whiteBright(label);
        case 'PUBLIC IP': return chalk.greenBright(label);
        case 'PLAYERS': return chalk.cyanBright(label);
        case 'DESCRIPTION': return chalk.bold(label);
        case 'UA': return chalk.gray(label);
        case 'LOCAL IP': return chalk.gray(label);
        case 'BUILD DATE': return chalk.gray(label);
        case 'TSHOCK': return chalk.blue(label);
        case 'TERRARIA': return chalk.green(label);
        case 'OS': return chalk.yellow(label);
        case 'MACHINE': return chalk.magenta(label);
        case 'ARCH': return chalk.cyan(label);
        case 'USER': return chalk.white(label);
        case 'DOTNET': return chalk.blueBright(label);
        case 'WORLD FILE': return chalk.greenBright(label);
        case 'WORLD SEED': return chalk.green(label);
        case 'WORLD SIZE': return chalk.yellowBright(label);
        case 'WORLD ID': return chalk.whiteBright(label);
        default: return chalk.white(label);
    }
}
function colorValue(label, value) {
    // Asigna colores a valores especiales o déjalos blancos
    if (value === 'N/A' || value === 'N_A') return chalk.gray(value);
    if (label.includes('PORT') || label === 'PLAYERS') return chalk.yellowBright(value);
    if (label === 'VALIDATED') return value === 'VALIDATED' ? chalk.greenBright(value) : chalk.redBright(value);
    if (label === 'PUBLIC IP' && value !== 'N/A' && value !== 'N_A') return chalk.green(value);
    return chalk.whiteBright(value);
}
function formatTableRow(label, value, pad = 15) {
    return colorLabel(label.padEnd(pad)) + chalk.gray(' : ') + colorValue(label.trim(), value);
}

function getCubaTimeString(date = new Date()) {
    // UTC-4 = 240 minutos
    const cubaDate = new Date(date.getTime() - (date.getTimezoneOffset() + 240) * 60000);
    return cubaDate.toLocaleTimeString('en-US', { hour12: true });
}
function centerText(text, width, filler = ' ') {
    const pad = Math.max(width - text.length, 0);
    const left = Math.floor(pad/2);
    const right = pad - left;
    return filler.repeat(left) + text + filler.repeat(right);
}
function separatorWithCubaTime(date = new Date(), width = 58) {
    const timeStr = `[ ${getCubaTimeString(date)} ]`;
    const pad = Math.max(width - timeStr.length, 0);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return chalk.gray('─'.repeat(left)) + chalk.whiteBright(timeStr) + chalk.gray('─'.repeat(right));
}
function centeredTitle(text, width = 58) {
    const upper = text.toUpperCase();
    return chalk.whiteBright(centerText(upper, width, ' '));
}
const plainSeparator = chalk.gray('─'.repeat(58));

router.get('/initialize/:pluginName', (req, res) => {
    const { pluginName } = req.params;
    const {
        port, validated, name, version, author, description, buildDate,
        tshockVersion, terrariaVersion, serverOs, machineName, processArch, processUser,
        dotnetVersion, publicIp, localIp, worldFile, worldSeed, worldSize, worldId,
        maxPlayers, currPlayers
    } = req.query;

    if (!pluginName || !port || !validated || !name) {
        logRequest(
            '❌ [INITIALIZE]',
            `Parámetros faltantes: ${chalk.redBright(`Plugin: ${pluginName || 'N/A'}, Puerto: ${port || 'N/A'}, Validado: ${validated || 'N/A'}, Nombre: ${name || 'N/A'}`)}`,
            chalk.red,
            false
        );
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    const clientIp = req.ip.replace('::ffff:', '');
    const userAgent = req.get('User-Agent') || 'N/A';

    // Datos principales
    const importantRows = [
        formatTableRow('PLUGIN', pluginName),
        formatTableRow('VERSION', version || 'N/A'),
        formatTableRow('AUTHOR', author || 'N/A'),
        formatTableRow('PORT', port),
        formatTableRow('VALIDATED', validated),
        formatTableRow('SERVER', name),
        formatTableRow('PUBLIC IP', publicIp || clientIp),
        formatTableRow('PLAYERS', `${currPlayers || 'N/A'} / ${maxPlayers || 'N/A'}`),
    ];

    // Datos adicionales
    const moreRows = [
        formatTableRow('DESCRIPTION', description || 'N/A'),
        formatTableRow('UA', userAgent),
        formatTableRow('LOCAL IP', localIp || 'N/A'),
        formatTableRow('BUILD DATE', buildDate || 'N_A'),
        formatTableRow('TSHOCK', tshockVersion || 'N/A'),
        formatTableRow('TERRARIA', terrariaVersion || 'N/A'),
        formatTableRow('OS', serverOs || 'N/A'),
        formatTableRow('MACHINE', machineName || 'N/A'),
        formatTableRow('ARCH', processArch || 'N/A'),
        formatTableRow('USER', processUser || 'N/A'),
        formatTableRow('DOTNET', dotnetVersion || 'N/A'),
        formatTableRow('WORLD FILE', worldFile || 'N/A'),
        formatTableRow('WORLD SEED', worldSeed || 'N/A'),
        formatTableRow('WORLD SIZE', worldSize || 'N/A'),
        formatTableRow('WORLD ID', worldId || 'N/A'),
    ];

    // Tabla alineada, con separador y hora de Cuba centrada
    const now = new Date();
    const tableLines = [
        separatorWithCubaTime(now),
        centeredTitle('inicialización de plugin telemetría'),
        plainSeparator,
        ...importantRows,
        plainSeparator,
        ...moreRows,
        plainSeparator,
        ''
    ];

    logRequest(
  	  '',
  	  tableLines.join('\n'),
  	  chalk.white,
  	  false, // No timestamp global (solo tu hora centrada)
 	   pluginName // <---- aquí el log irá a logs/[pluginName]/console-YYYY-MM-DD.log
	);

    res.json({
        success: true,
        message: 'Inicialización completada',
        data: {
            pluginName, port, validated, name, version, author, description, buildDate,
            tshockVersion, terrariaVersion, serverOs, machineName, processArch, processUser,
            dotnetVersion, publicIp: publicIp || clientIp, localIp, worldFile, worldSeed,
            worldSize, worldId, maxPlayers, currPlayers, userAgent
        },
    });
});

export default router;