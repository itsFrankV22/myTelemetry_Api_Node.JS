import express from 'express';
import chalk from 'chalk';
import { logRequest } from '../utils/log.js';
import dotenv from 'dotenv';
import { EmbedBuilder } from 'discord.js';

dotenv.config();
const router = express.Router();


function colorLabel(label) {
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

router.get('/initialize/:pluginName', async (req, res) => {
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
      `Need: ${chalk.redBright(`Plugin: ${pluginName || 'N/A'}, Puerto: ${port || 'N/A'}, Validado: ${validated || 'N/A'}, Nombre: ${name || 'N/A'}`)}`,
      chalk.red,
      false
    );
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const clientIp = req.ip.replace('::ffff:', '');
  const userAgent = req.get('User-Agent') || 'N/A';

  // Console Table
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

  const now = new Date();
  const tableLines = [
    separatorWithCubaTime(now),
    centeredTitle('INITIALIZED TOOL'),
    plainSeparator,
    ...importantRows,
    plainSeparator,
    ...moreRows,
    plainSeparator,
    ''
  ];

  logRequest('', tableLines.join('\n'), chalk.white, false, pluginName);

  // Discord message
  try {
    const embed = new EmbedBuilder()
  .setTitle(`🧩 initialized Tool`)
  .setDescription(`From **${name}**`)
  .setColor(0x00AE86)
  .addFields(
    // Información básica
    { name: '🔌 Tool', value: pluginName, inline: true },
    { name: '📦 Version', value: version || 'N/A', inline: true },
    { name: '👤 Auttor', value: author || 'N/A', inline: true },

    { name: '🌐 Status', value: validated, inline: true },
    { name: '📡 Port', value: port, inline: true },
    { name: '🧑‍🤝‍🧑 Players', value: `${currPlayers || 'N/A'} / ${maxPlayers || 'N/A'}`, inline: true },

    // Red e IPs
    { name: '🌍 Public IP', value: publicIp || clientIp, inline: true },
    { name: '🏠 Local IP', value: localIp || 'N/A', inline: true },
    { name: '🖥️ User Agent', value: userAgent, inline: true },

    // Sistema
    { name: '💻 OS', value: serverOs || 'N/A', inline: true },
    { name: '📦 .NET', value: dotnetVersion || 'N/A', inline: true },
    { name: '🏷️ Machine', value: machineName || 'N/A', inline: true },
    { name: '🔧 Arch', value: processArch || 'N/A', inline: true },
    { name: '👤 User', value: processUser || 'N/A', inline: true },

    // Versión de software
    { name: '🧠 TShock', value: tshockVersion || 'N/A', inline: true },
    { name: '🎮 Terraria', value: terrariaVersion || 'N/A', inline: true },
    { name: '🛠️ Build Date', value: buildDate || 'N/A', inline: true },

    // Mundo
    { name: '🗺️ World', value: worldFile || 'N/A', inline: true },
    { name: '🌱 Seed', value: worldSeed || 'N/A', inline: true },
    { name: '📏 Size', value: worldSize || 'N/A', inline: true },
    { name: '🆔 World ID', value: worldId || 'N/A', inline: true },

    // Descripción
    { name: '📝 Desc', value: description || 'N/A', inline: false }
  )
  .setTimestamp()
  .setFooter({ text: 'FV Studios', iconURL: 'https://i.imgur.com/YP5kVNk_d.webp?maxwidth=760&fidelity=grand' });

    if (process.env.DISCORD_ENABLED === 'true') {
  try {
    const { default: client } = await import('../Discord/bot.js');
    const channel = await client.channels.fetch(process.env.INITIALIZE_CHANNEL_ID);
    
    if (channel?.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('❌ Embed error:', err);
  }
}


  } catch (error) {
    console.error('❌ Embed error:', error);
  }

  // Respuesta final
  res.json({
    success: true,
    message: 'Sucess',
    data: {
      pluginName, port, validated, name, version, author, description, buildDate,
      tshockVersion, terrariaVersion, serverOs, machineName, processArch, processUser,
      dotnetVersion, publicIp: publicIp || clientIp, localIp, worldFile, worldSeed,
      worldSize, worldId, maxPlayers, currPlayers, userAgent
    },
  });
});

export default router;