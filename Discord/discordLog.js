import chalk from "chalk";

export function discordLog(type) {
    console.log(chalk.magentaBright('[ Discord ] ') + (type))
}