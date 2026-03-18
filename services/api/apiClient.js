import Config from '../../config/config';
import { getToken } from './authStorage';
import { refreshToken } from './tokenService';

export const apiClient = async (
    endpoint,
    options = {},
    retry = true
) => {

    let token = await getToken();

    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization:`Bearer ${token}` } : {})
    };

    const response = await fetch(
        `${Config.API_BASE_URL}${endpoint}`,
        { ...options, headers }
    );

    if (response.status === 401 && retry) {

        const newToken = await refreshToken();

        if (!newToken) throw new Error('Session expired');

        return apiClient(endpoint, options, false);
    }

    let data = null;

    try {
        data = await response.json();
    } catch {}

    if (!response.ok) {
        throw new Error(data?.message || 'Request failed');
    }

    return data;
};