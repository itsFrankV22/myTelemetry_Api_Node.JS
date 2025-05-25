import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { discordLog } from './discordLog.js';
import chalk from 'chalk';

dotenv.config();

const token = process.env.BOT_TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

export function startBot() {
    client.once(Events.ClientReady, readyClient => {
        discordLog(`Ready! [ ${chalk.blue(readyClient.user.tag)} ]`);
    });

    client.login(token).catch(err => {
        console.error('❌ Error connecting Discord bot:', err);
    });
}

export default client;
