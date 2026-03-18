import Config from '../../config/config';
import { getRefreshToken, saveTokens, clearTokens } from './authStorage';

export const refreshToken = async () => {

    const refresh = await getRefreshToken();
    if (!refresh) return null;

    try {

        const response = await fetch(`${Config.API_BASE_URL}/api/token/refresh`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ refreshToken: refresh })
        });

        if (!response.ok) {
            await clearTokens();
            return null;
        }

        const data = await response.json();

        await saveTokens(data.token, data.refreshToken);

        return data.token;

    } catch {
        return null;
    }
};