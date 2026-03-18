import { apiClient } from './api/apiClient';

export const fetchUserData = async (
    setData,
    setGlobalError,
    setGlobalLoading
) => {

    try {

        const data = await apiClient('/api/user-data',{
            method:'GET'
        });

        setData(data);

    } catch(err){
        setGlobalError(err.message);
    } finally{
        setGlobalLoading(false);
    }
};