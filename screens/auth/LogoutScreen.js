import { useEffect } from 'react';
import { logout } from '../../components/Apicalls';

export default function LogoutScreen({ navigation, setGlobalError, setGlobalLoading }) {

    useEffect(() => {
        const performLogout = async () => {
            try {
                setGlobalLoading(true);
                await logout(false, navigation, setGlobalError, setGlobalLoading);
            } catch (error) {
                setGlobalLoading(false);
                setGlobalError(error);
            } finally {
                setGlobalLoading(false);
            }
        };

        performLogout();
    }, []);
    return null; // Nothing else to render
}
