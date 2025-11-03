import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
//Screens
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import ProfileScreen from './screens/ProfileScreen';
import LogoutScreen from './screens/LogoutScreen';
import BordenScreen from './screens/BordenScreen';
import BordScreen from './screens/BordScreen';
import LoadingSpinner from "./components/Elements";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import ActivationScreen from "./screens/ActivationScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tabs for logged-in users
function AppTabs({setMenuVisible, setGlobalError, setGlobalLoading}) {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({color, size}) => {
                    let iconName;
                    if (route.name === 'Profile') iconName = 'person-outline';
                    else if (route.name === 'Borden') iconName = 'albums-outline';
                    else if (route.name === 'Logout') iconName = 'log-out-outline';
                    return <Ionicons name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {backgroundColor: '#1f65ff'},
                headerTintColor: '#fff',
                headerTitleAlign: 'center',
            })}
        >
            <Tab.Screen
                name="Profile"
                options={{headerTitle: 'Profile'}}
            >
                {props => <ProfileScreen {...props} setGlobalError={setGlobalError}
                                         setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
            <Tab.Screen name="Borden">
                {props => <BordenScreen {...props} setGlobalError={setGlobalError}
                                        setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
            <Tab.Screen name="Logout">
                {props => <LogoutScreen {...props} setGlobalError={setGlobalError}
                                        setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

// Main App
export default function App() {
    const [loading, setLoading] = useState(true);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            await AsyncStorage.getItem('token'); // optional initial check
            setLoading(false);
        };
        checkToken();
    }, []);

    // Global error component
    const ErrorBanner = () => (
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
                {/* Close icon in the top-right corner */}
                <TouchableOpacity
                    onPress={() => setGlobalError(false)}
                    style={{
                        position: 'absolute',
                        top: -5,
                        right: 8,
                        padding: 5,
                        zIndex: 1000,
                    }}
                >
                    <Ionicons name="close" size={35} color="white" />
                </TouchableOpacity>

                <Text
                    style={{
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        paddingRight: 25, // add padding so text doesn't overlap the icon
                    }}
                >
                    {globalError}
                </Text>
            </View>
        ) : null
    );

    const GlobalLoading = () => (
        globalLoading ? (
            <LoadingSpinner visible={globalLoading}/>
        ) : null
    );

    return (
        <NavigationContainer onStateChange={() => {
            if (globalError) setGlobalError(null);
        }}
        >
            <ErrorBanner/>
            <GlobalLoading/>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerTitleAlign: 'center',
                    headerStyle: {backgroundColor: '#1f65ff'},
                    headerTintColor: '#fff',
                    headerTitleStyle: {fontWeight: 'bold', fontSize: 18},
                    headerShadowVisible: false,
                    animation: 'fade_from_bottom',
                }}
            >
                <Stack.Screen name="Login">
                    {props => <LoginScreen {...props} setGlobalError={setGlobalError}
                                           setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="Registration">
                    {props => <RegistrationScreen {...props} setGlobalError={setGlobalError}
                                                  setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="ActivateAccount" options={{ title: 'Activate Account' }}>
                    {props => <ActivationScreen {...props} setGlobalError={setGlobalError}
                                                     setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="Profile" options={{ title: 'Profile' }}>
                    {props => <ProfileScreen {...props} setGlobalError={setGlobalError}
                                                setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="ForgotPassword" options={{ title: 'Forgot Password' }}>
                    {props => <ForgotPasswordScreen {...props} setGlobalError={setGlobalError}
                                                    setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="ResetPassword" options={{ title: 'Reset Password' }}>
                    {props => <ResetPasswordScreen {...props} setGlobalError={setGlobalError}
                                                    setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="ChangePassword" options={{ title: 'Change Password' }}>
                    {props => <ChangePasswordScreen {...props} setGlobalError={setGlobalError}
                                                   setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="Bord">
                    {props => <BordScreen {...props} setGlobalError={setGlobalError}
                                          setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
                <Stack.Screen name="MainTabs" options={{headerShown: false}}>
                    {props => <AppTabs {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
