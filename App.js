import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Screens
import SplashScreen from './screens/auth/SplashScreen';
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
import HomeScreen from './screens/home/HomeScreen';
import PublicBordScreen from './screens/lego/boards/PublicBordScreen';
import PublicSetDetailScreen from './screens/lego/set/PublicSetDetailScreen';
import PublicProfileScreen from './screens/profile/PublicProfileScreen';

function ErrorBanner({error, onDismiss}) {
    if (!error) return null;
    return (
        <View style={{
            backgroundColor: 'red',
            padding: 10,
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            zIndex: 1000,
        }}>
            <TouchableOpacity
                onPress={onDismiss}
                style={{position: 'absolute', top: -5, right: 8, padding: 5, zIndex: 1000}}
            >
                <Ionicons name="close" size={35} color="white"/>
            </TouchableOpacity>
            <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold', paddingRight: 25}}>
                {error}
            </Text>
        </View>
    );
}

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BordenStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const stackScreenOptions = {
    headerTitleAlign: 'center',
    headerStyle: {backgroundColor: '#1f65ff'},
    headerTintColor: '#fff',
    headerTitleStyle: {fontWeight: 'bold', fontSize: 18},
    headerShadowVisible: false,
    animation: 'fade_from_bottom',
    contentStyle: {backgroundColor: '#f8f8f8'},
};

function HomeStackNavigator({setGlobalError, setGlobalLoading}) {
    return (
        <HomeStack.Navigator screenOptions={stackScreenOptions}>
            <HomeStack.Screen name="HomeScreen" options={{title: 'Home'}}>
                {props => <HomeScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </HomeStack.Screen>
            <HomeStack.Screen name="PublicBord">
                {props => <PublicBordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </HomeStack.Screen>
            <HomeStack.Screen name="PublicSetDetail" options={{title: 'Set Detail'}}>
                {props => <PublicSetDetailScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </HomeStack.Screen>
            <HomeStack.Screen name="PublicProfile" options={{title: 'Profile'}}>
                {props => <PublicProfileScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </HomeStack.Screen>
        </HomeStack.Navigator>
    );
}

function BordenStackNavigator({setGlobalError, setGlobalLoading}) {
    return (
        <BordenStack.Navigator screenOptions={stackScreenOptions}>
            <BordenStack.Screen name="BordenScreen" options={{title: 'Borden'}}>
                {props => <BordenScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </BordenStack.Screen>
            <BordenStack.Screen name="Bord">
                {props => <BordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </BordenStack.Screen>
            <BordenStack.Screen name="SetDetail" options={{title: 'Set Detail'}}>
                {props => <SetDetailScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </BordenStack.Screen>
        </BordenStack.Navigator>
    );
}

function ProfileStackNavigator({setGlobalError, setGlobalLoading}) {
    return (
        <ProfileStack.Navigator screenOptions={stackScreenOptions}>
            <ProfileStack.Screen name="ProfileScreen" options={{title: 'Profile'}}>
                {props => <ProfileScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </ProfileStack.Screen>
            <ProfileStack.Screen name="ChangePassword" options={{title: 'Change Password'}}>
                {props => <ChangePasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </ProfileStack.Screen>
        </ProfileStack.Navigator>
    );
}

function AppTabs({setGlobalError, setGlobalLoading}) {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({color, size}) => {
                    let iconName;
                    if (route.name === 'Home') iconName = 'home-outline';
                    else if (route.name === 'Profile') iconName = 'person-outline';
                    else if (route.name === 'Borden') iconName = 'albums-outline';
                    else if (route.name === 'Logout') iconName = 'log-out-outline';
                    return <Ionicons name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                options={{unmountOnBlur: true}}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate('Home', { screen: 'HomeScreen' });
                    },
                })}
            >
                {props => <HomeStackNavigator {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
            <Tab.Screen name="Profile">
                {props => <ProfileStackNavigator {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
            <Tab.Screen
                name="Borden"
                options={{unmountOnBlur: true}}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate('Borden', { screen: 'BordenScreen' });
                    },
                })}
            >
                {props => <BordenStackNavigator {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
            <Tab.Screen name="Logout">
                {props => <LogoutScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

// Main App
export default function App() {
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    return (
        <NavigationContainer
            onStateChange={() => {
                if (globalError) setGlobalError(null);
            }}
        >
            <ErrorBanner error={globalError} onDismiss={() => setGlobalError(null)}/>
            <LoadingSpinner visible={globalLoading}/>
            <RootStack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerTitleAlign: 'center',
                    headerStyle: {backgroundColor: '#1f65ff'},
                    headerTintColor: '#fff',
                    headerTitleStyle: {fontWeight: 'bold', fontSize: 18},
                    headerShadowVisible: false,
                    animation: 'fade_from_bottom',
                }}
            >
                <RootStack.Screen name="Splash" options={{headerShown: false}}>
                    {props => <SplashScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="Login">
                    {props => <LoginScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="Registration">
                    {props => <RegistrationScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="ActivateAccount" options={{title: 'Activate Account'}}>
                    {props => <ActivationScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="ForgotPassword" options={{title: 'Forgot Password'}}>
                    {props => <ForgotPasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="ResetPassword" options={{title: 'Reset Password'}}>
                    {props => <ResetPasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="MainTabs" options={{headerShown: false}}>
                    {props => <AppTabs {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
