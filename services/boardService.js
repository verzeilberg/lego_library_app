import { apiClient } from './api/apiClient';

export const reloadData = async (
    id,
    setGlobalLoading,
    setBord,
    setGlobalError
) => {

    try {

        setGlobalLoading(true);

        const data = await apiClient(`/api/set-lists/${id}`,{
            method:'GET'
        });

        setBord(data);

    } catch(err){
        setGlobalError(err.message);
    } finally{
        setGlobalLoading(false);
    }
};