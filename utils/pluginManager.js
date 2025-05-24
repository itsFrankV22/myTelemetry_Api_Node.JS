import fs from 'fs';
import { PL_FILE } from '../config.js';

export function readPlugins() {
    if (!fs.existsSync(PL_FILE)) return [];
    return fs
        .readFileSync(PL_FILE, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}