import { configDotenv } from "dotenv";


const TIME_ZONE = configDotenv.TIME_ZONE;

export function formatTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
    return formatter.format(now);
}