import fs from 'fs';
import crypto from 'crypto';
import { KEYS_FILE } from '../config.js';

export function readKeys() {
    if (!fs.existsSync(KEYS_FILE)) return [];
    return fs
        .readFileSync(KEYS_FILE, 'utf-8')
        .split('\n')
        .map(line => {
            const [key, pluginName, status] = line.split(':');
            return { key, pluginName, expired: status === 'expired', removed: status === 'removed' };
        })
        .filter(item => item.key);
}

export function saveKeys(keys) {
    const formattedKeys = keys
        .map(
            k =>
                `${k.key}:${k.pluginName}:${
                    k.removed ? 'removed' : k.expired ? 'expired' : 'active'
                }`
        )
        .join('\n');
    fs.writeFileSync(KEYS_FILE, formattedKeys);
}

export function generateKey() {
    return crypto.randomBytes(16).toString('hex').match(/.{1,4}/g).join('-');
}