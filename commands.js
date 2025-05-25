import readline from 'readline';
import fs from 'fs';
import chalk from 'chalk';
import { generateKey, readKeys, saveKeys } from './utils/keyManager.js';
import { readPlugins } from './utils/pluginManager.js';
import { logRequest } from './utils/log.js';
import { PL_FILE } from './config.js';

let pluginsCache = [];
let keysCache = [];

function reloadData() {
    keysCache = readKeys();
    pluginsCache = readPlugins();
    console.log(chalk.yellow('🔄 Reloaded Data.'));
}
reloadData();

export function startConsoleCommands() {
    // ASCII art (opcional)
    console.log(chalk.cyan('Loagind commands...'));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.on('line', (input) => {
        const commandArgs = input.trim().split(' ');
        const command = commandArgs[0]?.toLowerCase();

        if (!command) return;

        switch (command) {
            case 'help':
                console.log(chalk.yellow("\n⌨️ Aviable commands:"));
                console.log(chalk.blue("• 'help'") + chalk.white(" - Show this text."));
                console.log(chalk.blue("• 'keygen'") + chalk.white(" - Generate a new key for a Tool."));
                console.log(chalk.blue("• 'keylist'") + chalk.white(" - Shows all generated keys, indicating their useful information."));
                console.log(chalk.blue("• 'keyremove #'") + chalk.white(" - Mark a key as REMOVED."));
                console.log(chalk.blue("• 'keyrenew #'") + chalk.white(" - Renew a REMOVED or EXPIRED key."));
                console.log(chalk.blue("• 'pllist'") + chalk.white(" - Lists registered Tools."));
                console.log(chalk.blue("• 'pladd'") + chalk.white(" - Add a new Tool."));
                console.log(chalk.blue("• 'plremove #'") + chalk.white(" - Delete a Tool by number."));
                console.log(chalk.blue("• 'reload'") + chalk.white(" - Reload data."));
                console.log(chalk.blue("• 'exit'") + chalk.white(" - Stop the Service"));
                break;

            case 'keygen':
                if (pluginsCache.length === 0) {
                    console.log(chalk.red('❌ There are no registered Tools. Add names to the PL.txt file. Use pladd'));
                    return;
                }
                console.log(chalk.yellow('🔢 Select a Tool by number:'));
                pluginsCache.forEach((plugin, index) => {
                    console.log(`${index + 1}. ${plugin}`);
                });
                rl.question('Enter the Tool number: ', (number) => {
                    const pluginIndex = parseInt(number) - 1;
                    if (
                        isNaN(pluginIndex) ||
                        pluginIndex < 0 ||
                        pluginIndex >= pluginsCache.length
                    ) {
                        console.log(chalk.red('❌ Invalid number.'));
                        return;
                    }
                    const pluginName = pluginsCache[pluginIndex];
                    const newKey = generateKey();
                    keysCache.unshift({ key: newKey, pluginName, expired: false, removed: false });
                    saveKeys(keysCache);
                    console.log(chalk.green(`✅ New key generated for ${pluginName}: ${newKey}`));
                    logRequest('KeyGen', `key:${newKey} name:${pluginName} status:active`);
                });
                break;

            case 'keylist': {
                const pageSize = 10;
                const totalPages = Math.ceil(keysCache.length / pageSize) || 1;
                const pageInput = commandArgs[1];
                const pageNumber = parseInt(pageInput) || 1;
                if (pageNumber < 1 || pageNumber > totalPages) {
                    console.log(chalk.red(`❌ Invalid page number. Choose between 1 and ${totalPages}.`));
                    return;
                }
                console.log(chalk.yellow(`\n🔑 Available keys (Page ${pageNumber}/${totalPages}):`));
                const reversed = [...keysCache].reverse();
                const start = (pageNumber - 1) * pageSize;
                const end = start + pageSize;
                const keysToShow = reversed.slice(start, end);
                keysToShow.forEach((k, i) => {
                    const displayNumber = start + i + 1;
                    const keyColor = k.removed
                        ? chalk.magenta
                        : k.expired
                        ? chalk.red
                        : chalk.green;
                    const status = k.removed
                        ? 'REMOVED'
                        : k.expired
                        ? 'EXPIRED'
                        : 'ACTIVE';
                    console.log(
                        chalk.blue(`${displayNumber}.`) +
                            keyColor(` ${k.key}`) +
                            chalk.white(` (tool: ${k.pluginName}, ${status})`)
                    );
                });
                if (pageNumber < totalPages)
                    console.log(chalk.green(`\n➡️ To see more keys, enter 'keylist ${pageNumber + 1}'.`));
                else
                    console.log(chalk.green('\n✅ There are no more pages available.'));
                break;
            }

            case 'keyremove': {
                const keyNumber = parseInt(commandArgs[1]);
                const reversed = [...keysCache].reverse();
                if (isNaN(keyNumber) || keyNumber < 1 || keyNumber > reversed.length) {
                    console.log(chalk.red(`❌ invalid number, type 1 / ${reversed.length}.`));
                    return;
                }
                const realIndex = keysCache.length - keyNumber;
                const keyToRemove = keysCache[realIndex];
                if (keyToRemove.removed || keyToRemove.expired) {
                    console.log(chalk.red(`❌ the key already ${keyToRemove.removed ? 'REMOVED' : 'EXPIRED'}.`));
                    return;
                }
                keyToRemove.removed = true;
                saveKeys(keysCache);
                console.log(chalk.green(`✅ key "${keyToRemove.key}" has been removed.`));
                break;
            }

            case 'keyrenew': {
                const renewKeyNumber = parseInt(commandArgs[1]);
                const reversed = [...keysCache].reverse();
                if (isNaN(renewKeyNumber) || renewKeyNumber < 1 || renewKeyNumber > reversed.length) {
                    console.log(chalk.red(`❌ invalid number, type 1 / ${reversed.length}.`));
                    return;
                }
                const realIndex = keysCache.length - renewKeyNumber;
                const keyToRenew = keysCache[realIndex];
                if (!keyToRenew.removed && !keyToRenew.expired) {
                    console.log(chalk.red('❌ the key already active.'));
                    return;
                }
                keyToRenew.removed = false;
                keyToRenew.expired = false;
                saveKeys(keysCache);
                console.log(chalk.green(`✅ key "${keyToRenew.key}" has been renewed.`));
                break;
            }

            case 'pladd':
                rl.question('type name: ', (toolName) => {
                    if (!toolName.trim()) {
                        console.log(chalk.red('❌ invalid name.'));
                        return;
                    }
                    const trimmed = toolName.trim();
                    if (pluginsCache.includes(trimmed)) {
                        console.log(chalk.yellow(`⚠️ tool "${trimmed}" already registered.`));
                        return;
                    }
                    pluginsCache.push(trimmed);
                    fs.appendFileSync(PL_FILE, `${trimmed}\n`);
                    console.log(chalk.green(`✅ Tool "${trimmed}" added.`));
                    logRequest('PLAdd', `Tool: ${trimmed} added.`, chalk.blue);
                });
                break;

            case 'pllist':
                if (pluginsCache.length === 0) {
                    console.log(chalk.red('❌ There are no Tools registered in PL.txt.'));
                } else {
                    console.log(chalk.yellow('📋 Tools registered:'));
                    pluginsCache.forEach((plugin, index) => {
                        console.log(`${index + 1}. ${plugin}`);
                    });
                }
                break;

            case 'plremove': {
                if (pluginsCache.length === 0) {
                    console.log(chalk.red('❌ There are no Tools registered in PL.txt.'));
                    return;
                }
                const toolNumber = parseInt(commandArgs[1]);
                if (isNaN(toolNumber) || toolNumber < 1 || toolNumber > pluginsCache.length) {
                    console.log(chalk.red(`❌ Invalid number. Enter a number between 1 and ${pluginsCache.length}.`));
                    return;
                }
                const toolToRemove = pluginsCache[toolNumber - 1];
                pluginsCache.splice(toolNumber - 1, 1);
                fs.writeFileSync(PL_FILE, pluginsCache.join('\n'));
                console.log(chalk.green(`✅ Tool "${toolToRemove}" removed.`));
                logRequest('PLRemove', `Tool: ${toolToRemove} removed.`, chalk.magenta);
                break;
            }

            case 'reload':
                reloadData();
                break;

            case 'exit':
                console.log(chalk.red('🛑 Closing...'));
                process.exit(0);
                break;

            default:
                console.log(
                    chalk.red(
                        "❌ Unknow command, try /help"
                    )
                );
        }
    });
}