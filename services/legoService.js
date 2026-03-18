import { apiClient } from './api/apiClient';

export const handleSubmitSetRating = async (
    setId,
    rating,
    setGlobalError,
    setGlobalLoading
) => {

    try {

        setGlobalLoading(true);

        const data = await apiClient(
            '/api/lego/sets/rate-set',
            {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    setId:String(setId),
                    rating:Number(rating)
                })
            }
        );

        return data.rating ?? null;

    } catch(err){
        setGlobalError(err.message);
        return null;
    } finally{
        setGlobalLoading(false);
    }
};