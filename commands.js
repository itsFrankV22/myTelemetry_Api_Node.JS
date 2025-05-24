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
    console.log(chalk.yellow('🔄 Datos recargados correctamente.'));
}
reloadData();

export function startConsoleCommands() {
    // ASCII art (opcional)
    console.log(chalk.cyan('== Servidor de Validación de Plugins =='));

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
                console.log(chalk.yellow("\n⌨️ Comandos disponibles:"));
                console.log(chalk.blue("• 'help'") + chalk.white(" - Muestra esta ayuda."));
                console.log(chalk.blue("• 'keygen'") + chalk.white(" - Genera una nueva clave para una Herramienta."));
                console.log(chalk.blue("• 'keylist'") + chalk.white(" - Muestra todas las claves generadas, indicando su información útil."));
                console.log(chalk.blue("• 'keyremove #'") + chalk.white(" - Marca una clave como REMOVIDA."));
                console.log(chalk.blue("• 'keyrenew #'") + chalk.white(" - Renueva una clave REMOVIDA o EXPIRADA."));
                console.log(chalk.blue("• 'pllist'") + chalk.white(" - Lista las Herramientas registradas."));
                console.log(chalk.blue("• 'pladd'") + chalk.white(" - Agrega una nueva Herramienta."));
                console.log(chalk.blue("• 'plremove #'") + chalk.white(" - Elimina una Herramienta por número."));
                console.log(chalk.blue("• 'reload'") + chalk.white(" - Recarga los datos desde disco."));
                console.log(chalk.blue("• 'exit'") + chalk.white(" - Detiene el Servicio"));
                break;

            case 'keygen':
                if (pluginsCache.length === 0) {
                    console.log(chalk.red('❌ No hay Herramientas registradas. Agrega nombres al archivo PL.txt.'));
                    return;
                }
                console.log(chalk.yellow('🔢 Selecciona una Herramienta por número:'));
                pluginsCache.forEach((plugin, index) => {
                    console.log(`${index + 1}. ${plugin}`);
                });
                rl.question('Introduce el número de la Herramienta: ', (number) => {
                    const pluginIndex = parseInt(number) - 1;
                    if (
                        isNaN(pluginIndex) ||
                        pluginIndex < 0 ||
                        pluginIndex >= pluginsCache.length
                    ) {
                        console.log(chalk.red('❌ Número inválido.'));
                        return;
                    }
                    const pluginName = pluginsCache[pluginIndex];
                    const newKey = generateKey();
                    keysCache.unshift({ key: newKey, pluginName, expired: false, removed: false });
                    saveKeys(keysCache);
                    console.log(chalk.green(`✅ Nueva clave generada para ${pluginName}: ${newKey}`));
                    logRequest('KeyGen', `key:${newKey} name:${pluginName} status:active`);
                });
                break;

            case 'keylist': {
                const pageSize = 10;
                const totalPages = Math.ceil(keysCache.length / pageSize) || 1;
                const pageInput = commandArgs[1];
                const pageNumber = parseInt(pageInput) || 1;
                if (pageNumber < 1 || pageNumber > totalPages) {
                    console.log(chalk.red(`❌ Número de página inválido. Elige entre 1 y ${totalPages}.`));
                    return;
                }
                console.log(chalk.yellow(`\n🔑 Claves disponibles (Página ${pageNumber}/${totalPages}):`));
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
                        ? 'REMOVIDA'
                        : k.expired
                        ? 'EXPIRADA'
                        : 'ACTIVA';
                    console.log(
                        chalk.blue(`${displayNumber}.`) +
                            keyColor(` ${k.key}`) +
                            chalk.white(` (Herramienta: ${k.pluginName}, ${status})`)
                    );
                });
                if (pageNumber < totalPages)
                    console.log(chalk.green(`\n➡️ Para ver más claves, ingresa 'keylist ${pageNumber + 1}'.`));
                else
                    console.log(chalk.green('\n✅ No hay más páginas disponibles.'));
                break;
            }

            case 'keyremove': {
                const keyNumber = parseInt(commandArgs[1]);
                const reversed = [...keysCache].reverse();
                if (isNaN(keyNumber) || keyNumber < 1 || keyNumber > reversed.length) {
                    console.log(chalk.red(`❌ Número inválido. Introduce un número entre 1 y ${reversed.length}.`));
                    return;
                }
                const realIndex = keysCache.length - keyNumber;
                const keyToRemove = keysCache[realIndex];
                if (keyToRemove.removed || keyToRemove.expired) {
                    console.log(chalk.red(`❌ La clave ya está ${keyToRemove.removed ? 'REMOVIDA' : 'EXPIRADA'}.`));
                    return;
                }
                keyToRemove.removed = true;
                saveKeys(keysCache);
                console.log(chalk.green(`✅ La clave "${keyToRemove.key}" ha sido marcada como REMOVIDA.`));
                break;
            }

            case 'keyrenew': {
                const renewKeyNumber = parseInt(commandArgs[1]);
                const reversed = [...keysCache].reverse();
                if (isNaN(renewKeyNumber) || renewKeyNumber < 1 || renewKeyNumber > reversed.length) {
                    console.log(chalk.red(`❌ Número inválido. Introduce un número entre 1 y ${reversed.length}.`));
                    return;
                }
                const realIndex = keysCache.length - renewKeyNumber;
                const keyToRenew = keysCache[realIndex];
                if (!keyToRenew.removed && !keyToRenew.expired) {
                    console.log(chalk.red('❌ La clave ya está ACTIVA.'));
                    return;
                }
                keyToRenew.removed = false;
                keyToRenew.expired = false;
                saveKeys(keysCache);
                console.log(chalk.green(`✅ La clave "${keyToRenew.key}" ha sido renovada a ACTIVA.`));
                break;
            }

            case 'pladd':
                rl.question('Introduce el nombre de la nueva Herramienta: ', (toolName) => {
                    if (!toolName.trim()) {
                        console.log(chalk.red('❌ Nombre inválido. Intenta nuevamente.'));
                        return;
                    }
                    const trimmed = toolName.trim();
                    if (pluginsCache.includes(trimmed)) {
                        console.log(chalk.yellow(`⚠️ La herramienta "${trimmed}" ya está registrada.`));
                        return;
                    }
                    pluginsCache.push(trimmed);
                    fs.appendFileSync(PL_FILE, `${trimmed}\n`);
                    console.log(chalk.green(`✅ Herramienta "${trimmed}" agregada exitosamente.`));
                    logRequest('PLAdd', `Herramienta: ${trimmed} agregada.`, chalk.blue);
                });
                break;

            case 'pllist':
                if (pluginsCache.length === 0) {
                    console.log(chalk.red('❌ No hay Herramientas registradas en PL.txt.'));
                } else {
                    console.log(chalk.yellow('📋 Herramientas Registradas:'));
                    pluginsCache.forEach((plugin, index) => {
                        console.log(`${index + 1}. ${plugin}`);
                    });
                }
                break;

            case 'plremove': {
                if (pluginsCache.length === 0) {
                    console.log(chalk.red('❌ No hay Herramientas registradas para eliminar.'));
                    return;
                }
                const toolNumber = parseInt(commandArgs[1]);
                if (isNaN(toolNumber) || toolNumber < 1 || toolNumber > pluginsCache.length) {
                    console.log(chalk.red(`❌ Número inválido. Introduce un número entre 1 y ${pluginsCache.length}.`));
                    return;
                }
                const toolToRemove = pluginsCache[toolNumber - 1];
                pluginsCache.splice(toolNumber - 1, 1);
                fs.writeFileSync(PL_FILE, pluginsCache.join('\n'));
                console.log(chalk.green(`✅ Herramienta "${toolToRemove}" eliminada exitosamente.`));
                logRequest('PLRemove', `Herramienta: ${toolToRemove} eliminada.`, chalk.magenta);
                break;
            }

            case 'reload':
                reloadData();
                break;

            case 'exit':
                console.log(chalk.red('🛑 Cerrando servidor...'));
                process.exit(0);
                break;

            default:
                console.log(
                    chalk.red(
                        "❌ Comando no reconocido. Usa 'help' para ver los comandos disponibles."
                    )
                );
        }
    });
}