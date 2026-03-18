import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegistrationScreen from './screens/auth/RegistrationScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import LogoutScreen from './screens/auth/LogoutScreen';
import BordenScreen from './screens/lego/boards/BordenScreen';
import BordScreen from './screens/lego/boards/BordScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import ChangePasswordScreen from './screens/auth/ChangePasswordScreen';
import ActivationScreen from './screens/activation/ActivationScreen';
import SetDetailScreen from './screens/lego/set/SetDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tabs for logged-in users
function AppTabs({ setGlobalError, setGlobalLoading }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Profile') iconName = 'person-outline';
                    else if (route.name === 'Borden') iconName = 'albums-outline';
                    else if (route.name === 'Logout') iconName = 'log-out-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                headerStyle: { backgroundColor: '#1f65ff' },
                headerTintColor: '#fff',
                headerTitleAlign: 'center',
            })}
        >
            <Tab.Screen name="Profile">
                {props => <ProfileScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
            </Tab.Screen>
            <Tab.Screen name="Borden">
                {props => <BordenScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
            </Tab.Screen>
            <Tab.Screen name="Logout">
                {props => <LogoutScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

// Main App
export default function App() {
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    // Initial token check
    useEffect(() => {
        const checkToken = async () => {
            await AsyncStorage.getItem('token'); // optional check
            setGlobalLoading(false);
        };
        checkToken();
    }, []);

    // Global error banner
    const ErrorBanner = () =>
        globalError ? (
            <View
                style={{
                    backgroundColor: 'red',
                    padding: 10,
                    position: 'absolute',
                    top: 80,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                }}
            >
                <TouchableOpacity
                    onPress={() => setGlobalError(null)}
                    style={{ position: 'absolute', top: -5, right: 8, padding: 5, zIndex: 1000 }}
                >
                    <Ionicons name="close" size={35} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', paddingRight: 25 }}>
                    {globalError}
                </Text>
            </View>
        ) : null;

    // Global loading spinner
    const GlobalLoading = () => (globalLoading ? <LoadingSpinner visible={globalLoading} /> : null);

    return (
        <NavigationContainer
            onStateChange={() => {
                if (globalError) setGlobalError(null);
            }}
        >
            <ErrorBanner />
            <GlobalLoading />
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#1f65ff' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
                    headerShadowVisible: false,
                    animation: 'fade_from_bottom',
                }}
            >
                <Stack.Screen name="Login">
                    {props => <LoginScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="Registration">
                    {props => <RegistrationScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="ActivateAccount" options={{ title: 'Activate Account' }}>
                    {props => <ActivationScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="Profile" options={{ title: 'Profile' }}>
                    {props => <ProfileScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="ForgotPassword" options={{ title: 'Forgot Password' }}>
                    {props => <ForgotPasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="ResetPassword" options={{ title: 'Reset Password' }}>
                    {props => <ResetPasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="ChangePassword" options={{ title: 'Change Password' }}>
                    {props => <ChangePasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="Bord">
                    {props => <BordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="SetDetail" options={{ title: 'Set Detail' }}>
                    {props => <SetDetailScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
                <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                    {props => <AppTabs {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
