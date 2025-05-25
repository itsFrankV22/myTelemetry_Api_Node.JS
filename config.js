import path from 'path';
import { fileURLToPath } from 'url';

export const BASE_PATH = path.dirname(fileURLToPath(import.meta.url));

export const SECRET_KEY = 'secret_loveXD'
export const TIME_ZONE = 'America/Havana'
export const PORT = 8121;

export const DATA_FOLDER = path.join(BASE_PATH, 'DataFiles');
export const LOGS_FOLDER = path.join(DATA_FOLDER, 'Logs');
export const KEYS_FILE = path.join(DATA_FOLDER, 'keys.txt');
export const PL_FILE = path.join(DATA_FOLDER, 'PL.txt');
export const LOG_FILE = path.join(DATA_FOLDER, 'access.log');