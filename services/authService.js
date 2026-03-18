import { apiClient } from './api/apiClient';
import { saveTokens, clearTokens } from './api/authStorage';

export const handleSubmitLogin = async (
    email,
    password,
    navigation,
    setGlobalError
) => {

    try {

        const result = await apiClient('/api/login',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email,password})
        });

        await saveTokens(result.token, result.refresh_token);

        navigation.replace('MainTabs');

    } catch(err){
        setGlobalError(err.message);
    }
};