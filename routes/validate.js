import express from 'express';
import { readKeys, saveKeys } from '../utils/keyManager.js';
import { EmbedBuilder } from 'discord.js';

const router = express.Router();

router.get('/validate/:key/:pluginName', async (req, res) => {
    const { key, pluginName } = req.params;
    const { port, name, ip, ...others } = req.query;

    if (!key || !pluginName || !port || !name || !ip) {
        return res.status(400).json({ valid: false, message: 'Missing required parameters: key, pluginName, port, name, ip' });
    }

    const keys = readKeys();
    const keyObj = keys.find(k => k.key === key);

    let valid = true;
    let validationMessage = '✅ Valid Key';
    let embedColor = 0x00cc66;

    if (!keyObj) {
        valid = false;
        validationMessage = '❌ Invalid Key';
        embedColor = 0xcc3300;
    } else if (keyObj.pluginName !== pluginName) {
        valid = false;
        validationMessage = '❌ Invalid Key';
        embedColor = 0xcc3300;
    } else if (keyObj.expired || keyObj.removed) {
        valid = false;
        validationMessage = '❌ Expired Key';
        embedColor = 0xcc3300;
    }

    // Embed
    const validationEmbed = new EmbedBuilder()
        .setTitle(`${valid ? '✅' : '❌'} Validation ${valid ? 'Successful' : 'Failed'}`)
        .setColor(embedColor)
        .addFields(
            { name: '🔐 Key', value: `\`${key.slice(0, 6)}...${key.slice(-4)}\``, inline: true },
            { name: '📦 Tool', value: pluginName, inline: true },
            { name: '🌍 IP', value: ip, inline: true },
            { name: '🧑 Server', value: name, inline: true },
            { name: '📡 Port', value: port.toString(), inline: true },
            { name: '📝 Status', value: valid ? 'Validated' : validationMessage, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'FV Studios', iconURL: 'https://i.imgur.com/YP5kVNk_d.webp?maxwidth=760&fidelity=grand' });

    if (process.env.DISCORD_ENABLED === 'true') {
    try {
      const { default: client } = await import('../Discord/bot.js');
      const channel = await client.channels.fetch(process.env.REPORT_CHANNEL_ID);
      if (channel?.isTextBased()) {
        await channel.send({ embeds: [validationEmbed] });
      }
    } catch (err) {
      console.error('Embed Error', err);
    }
  }

    if (keyObj) {
    keyObj.expired = true;
    saveKeys(keys);
    } else {
    // Maneja el caso donde no se encontró el keyObj
    console.log('Key no encontrada');
    }

    return res.json({
    valid,   // envía el valor correcto según la validación
    message: valid
        ? `[${pluginName}] Validated "${name}" from ${ip}:${port}`
        : validationMessage,
    extras: others
    });
});

export default router;
