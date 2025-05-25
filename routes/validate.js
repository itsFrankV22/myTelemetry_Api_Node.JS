import express from 'express';
import { readKeys, saveKeys } from '../utils/keyManager.js';

const router = express.Router();

router.get('/validate/:key/:pluginName', (req, res) => {
    const { key, pluginName } = req.params;
    const { port, name, ip, ...others } = req.query;

    // Required parameters check
    if (!key || !pluginName || !port || !name) {
        return res.status(400).json({ valid: false, message: 'Missing required parameters: key, pluginName, port, name, ip' });
    }

    let keys = readKeys();
    const keyObj = keys.find(k => k.key === key);

    if (!keyObj) {
        return res.json({ valid: false, message: 'Token does not exist' });
    }

    if (keyObj.pluginName !== pluginName) {
        return res.json({ valid: false, message: 'Token does not match the requested service' });
    }

    if (keyObj.expired || keyObj.removed) {
        return res.json({ valid: false, message: 'Token is invalid or already used' });
    }

    // Invalidate the key (single use)
    keyObj.expired = true;
    saveKeys(keys);

    // ... Working ;(

    // Successful validation
    return res.json({
        valid: true,
        message: `[${pluginName}] Plugin validated successfully for "${name}" from ${ip}:${port}`,
        extras: others // Optional: return extra info for debug/logging
    });
});

export default router;