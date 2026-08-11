import 'react-native-gesture-handler';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LoadingSpinner from './components/ui/LoadingSpinner';
import {ThemeProvider, useTheme} from './theme/ThemeContext';
import {ErrorProvider, useError} from './contexts/ErrorContext';

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
import ProfileConfigScreen from './screens/profile/ProfileConfigScreen';
import ProfilePictureScreen from './screens/profile/ProfilePictureScreen';
import ProfileEditScreen from './screens/profile/ProfileEditScreen';
import FriendsScreen from './screens/social/FriendsScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BordenStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const FriendsStack = createNativeStackNavigator();

const NavTree = React.memo(({setGlobalError, setGlobalLoading}) => {
    const { colors } = useTheme();

    const stackScreenOptions = useMemo(() => ({
        headerTitleAlign: 'center',
        headerStyle: {backgroundColor: colors.headerBg},
        headerTintColor: colors.headerTitle,
        headerTitleStyle: {fontWeight: 'bold', fontSize: 18},
        headerShadowVisible: false,
        animation: 'fade_from_bottom',
        contentStyle: {backgroundColor: colors.background},
    }), [colors]);

    function HomeStackNavigator({setGlobalError: sg, setGlobalLoading: sl}) {
        return (
            <HomeStack.Navigator screenOptions={stackScreenOptions}>
                <HomeStack.Screen name="HomeScreen" options={{title: 'Home'}}>
                    {props => <HomeScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </HomeStack.Screen>
                <HomeStack.Screen name="PublicBord">
                    {props => <PublicBordScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </HomeStack.Screen>
                <HomeStack.Screen name="PublicSetDetail" options={{title: 'Set Detail'}}>
                    {props => <PublicSetDetailScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </HomeStack.Screen>
                <HomeStack.Screen name="PublicProfile" options={{title: 'Profile'}}>
                    {props => <PublicProfileScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </HomeStack.Screen>
            </HomeStack.Navigator>
        );
    }

    function BordenStackNavigator({setGlobalError: sg, setGlobalLoading: sl}) {
        return (
            <BordenStack.Navigator screenOptions={stackScreenOptions}>
                <BordenStack.Screen name="BordenScreen" options={{title: 'Borden'}}>
                    {props => <BordenScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </BordenStack.Screen>
                <BordenStack.Screen name="Bord">
                    {props => <BordScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </BordenStack.Screen>
                <BordenStack.Screen name="SetDetail" options={{title: 'Set Detail'}}>
                    {props => <SetDetailScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </BordenStack.Screen>
            </BordenStack.Navigator>
        );
    }

    function ProfileStackNavigator({setGlobalError: sg, setGlobalLoading: sl}) {
        return (
            <ProfileStack.Navigator screenOptions={stackScreenOptions}>
                <ProfileStack.Screen name="ProfileScreen" options={{title: 'Profile'}}>
                    {props => <ProfileScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </ProfileStack.Screen>
                <ProfileStack.Screen name="PublicProfile" options={{title: 'Profile'}}>
                    {props => <PublicProfileScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </ProfileStack.Screen>
                <ProfileStack.Screen name="ChangePassword" options={{title: 'Change Password'}}>
                    {props => <ChangePasswordScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </ProfileStack.Screen>
                <ProfileStack.Screen name="ProfileConfig" options={{title: 'Instellingen'}}>
                    {props => <ProfileConfigScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </ProfileStack.Screen>
                <ProfileStack.Screen name="ProfilePicture" options={{headerShown: false, presentation: 'transparentModal', contentStyle: {backgroundColor: 'transparent'}}}>
                    {props => <ProfilePictureScreen {...props}/>}
                </ProfileStack.Screen>
                <ProfileStack.Screen name="ProfileEdit" options={{title: 'Bewerk profiel'}}>
                    {props => <ProfileEditScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </ProfileStack.Screen>
            </ProfileStack.Navigator>
        );
    }

    function FriendsStackNavigator({setGlobalError: sg, setGlobalLoading: sl}) {
        return (
            <FriendsStack.Navigator screenOptions={stackScreenOptions}>
                <FriendsStack.Screen name="FriendsScreen" options={{title: 'Vrienden'}}>
                    {props => <FriendsScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </FriendsStack.Screen>
                <FriendsStack.Screen name="PublicProfile" options={{title: 'Profile'}}>
                    {props => <PublicProfileScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </FriendsStack.Screen>
            </FriendsStack.Navigator>
        );
    }

    function AppTabs({setGlobalError: sg, setGlobalLoading: sl}) {
        return (
            <Tab.Navigator
                screenOptions={({route}) => ({
                    tabBarIcon: ({color, size}) => {
                        let iconName;
                        if (route.name === 'Home') iconName = 'home-outline';
                        else if (route.name === 'Profile') iconName = 'person-outline';
                        else if (route.name === 'Vrienden') iconName = 'people-outline';
                        else if (route.name === 'Borden') iconName = 'albums-outline';
                        else if (route.name === 'Logout') iconName = 'log-out-outline';
                        return <Ionicons name={iconName} size={size} color={color}/>;
                    },
                    tabBarActiveTintColor: colors.tabActive,
                    tabBarInactiveTintColor: colors.tabInactive,
                    headerShown: false,
                    tabBarStyle: {backgroundColor: colors.surface, borderTopColor: colors.border},
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
                    {props => <HomeStackNavigator {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </Tab.Screen>
                <Tab.Screen
                    name="Profile"
                    listeners={({navigation}) => ({
                        tabPress: () => {
                            navigation.navigate('Profile', {screen: 'ProfileScreen'});
                        },
                    })}
                >
                    {props => <ProfileStackNavigator {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </Tab.Screen>
                <Tab.Screen
                    name="Vrienden"
                    options={{unmountOnBlur: true}}
                >
                    {props => <FriendsStackNavigator {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
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
                    {props => <BordenStackNavigator {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </Tab.Screen>
                <Tab.Screen name="Logout">
                    {props => <LogoutScreen {...props} setGlobalError={sg} setGlobalLoading={sl}/>}
                </Tab.Screen>
            </Tab.Navigator>
        );
    }

    return (
        <NavigationContainer
            onStateChange={() => {
                if (setGlobalError) setGlobalError(null);
            }}
        >
            <RootStack.Navigator
                initialRouteName="Splash"
                screenOptions={stackScreenOptions}
            >
                <RootStack.Screen name="Splash" options={{headerShown: false}}>
                    {props => <SplashScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="Login" options={{headerStyle: {backgroundColor: '#fe0000'}}}>
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
                <RootStack.Screen name="ChangePassword" options={{title: 'Change Password'}}>
                    {props => <ChangePasswordScreen {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
                <RootStack.Screen name="MainTabs" options={{headerShown: false}}>
                    {props => <AppTabs {...props} setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading}/>}
                </RootStack.Screen>
            </RootStack.Navigator>
        </NavigationContainer>
    );
});

function AppShell() {
    const [globalLoading, setGlobalLoading] = useState(false);
    const {setGlobalError} = useError();

    return (
        <View style={{flex: 1}}>
            <NavTree setGlobalError={setGlobalError} setGlobalLoading={setGlobalLoading} />
            <LoadingSpinner visible={globalLoading}/>
        </View>
    );
}

// Main App
export default function App() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ErrorProvider>
                <ThemeProvider>
                    <AppShell />
                </ThemeProvider>
            </ErrorProvider>
        </GestureHandlerRootView>
    );
}
