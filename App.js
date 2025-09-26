import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, Text, StyleSheet, TouchableOpacity, Pressable, Button, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import ProfileScreen from './screens/ProfileScreen';
import LogoutScreen from './screens/LogoutScreen';
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import ActivationScreen from "./screens/ActivationScreen";
import BordenScreen from "./screens/BordenScreen";
import {globalStyles} from './styles';
import Sidebar from './components/Sidebar';

const Stack = createNativeStackNavigator();

function App() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    // Function to check for token
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            setIsLoggedIn(!!token);
        } catch (error) {
            console.error('Error checking token', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Hit hem up high!')
        checkToken();
    }, []);

    if (loading) {
        // Show loading spinner while checking token
        return (
            <View style={globalStyles.loader}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <View style={{flex: 1}}>
                {/* Sidebar Above Navigator */}
                <Sidebar visible={menuVisible} closeMenu={() => setMenuVisible(false)}/>

                <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                        headerTitleAlign: 'center',
                        headerStyle: {backgroundColor: '#1f65ff'},
                        headerTintColor: '#fff',
                        headerTitleStyle: {fontWeight: 'bold', fontSize: 18},
                        headerShadowVisible: false,
                        animation: 'fade_from_bottom',
                        contentStyle: {backgroundColor: '#f8f8f8'},
                        headerShown: true
                    }}
                >
                    <Stack.Screen name="Login"
                                  component={LoginScreen}
                                  options={{
                                      title: 'Login',
                                      animation: 'slide_from_right',
                                      headerBackVisible: false,
                                      headerShown: false
                    }}/>
                    <Stack.Screen name="Profile"
                                  component={ProfileScreen}
                                  options={{
                                      title: 'Profile',
                                      animation: 'slide_from_right',
                                      headerBackVisible: false,
                                      headerRight: () => {
                                          const navigation = useNavigation();
                                          return (
                                              <Pressable style={globalStyles.hamburger}
                                                         onPressIn={() => setMenuVisible(true)}>
                                                  <Text style={globalStyles.hamburgerText}>☰</Text>
                                              </Pressable>
                                          );
                                      },
                                  }}/>
                    <Stack.Screen name="Registration" component={RegistrationScreen}
                                  options={{title: 'Registration', animation: 'slide_from_right'}}/>
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
                                  options={{title: 'Forgot Password', animation: 'slide_from_right'}}/>
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}
                                  options={{title: 'Reset Password', animation: 'slide_from_right'}}/>
                    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}
                                  options={{title: 'Change Password', animation: 'slide_from_right'}}/>
                    <Stack.Screen name="ActivateAccount" component={ActivationScreen}
                                  options={{title: 'Activate account', animation: 'slide_from_right'}}/>
                    <Stack.Screen name="Borden"
                                  component={BordenScreen}
                                  options={{
                                      title: 'Borden',
                                      animation: 'slide_from_right',
                                      headerBackVisible: false,
                                      headerRight: () => {
                                          const navigation = useNavigation();
                                          return (
                                              <Pressable style={globalStyles.hamburger}
                                                         onPressIn={() => setMenuVisible(true)}>
                                                  <Text style={globalStyles.hamburgerText}>☰</Text>
                                              </Pressable>
                                          );
                                      },
                    }}/>
                    <Stack.Screen name="Logout" component={LogoutScreen}
                                  options={{title: 'Logout', animation: 'slide_from_right'}}/>
                </Stack.Navigator>
            </View>
        </NavigationContainer>


    );
}

export default App;
