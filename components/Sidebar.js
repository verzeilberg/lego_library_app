import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {globalStyles} from '../styles';
import Icon from "react-native-vector-icons/FontAwesome";

export default function Sidebar({ visible, closeMenu }) {

    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(-250)).current; // Sidebar starts hidden

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : -250, // Slide in if visible, slide out otherwise
            duration: 300,
            useNativeDriver: false, // Must be false for layout animations
        }).start();
    }, [visible]);

    return (
        <Animated.View style={[globalStyles.sideBar, { left: slideAnim }]}>
            <TouchableOpacity onPress={closeMenu} style={globalStyles.closeButton}>
                <Text style={globalStyles.closeText}>×</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                closeMenu();
                navigation.navigate('Profile');
            }} style={globalStyles.sideBar.menuItem}>
                <Text style={globalStyles.sideBar.menuText}>
                    <Icon name='user' size={20} style={globalStyles.sideBar.icon}/> Profile
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                closeMenu();
                navigation.navigate('Logout');
            }} style={globalStyles.sideBar.menuItem}>
                <Text style={globalStyles.sideBar.menuText}>
                    <Icon name='sign-out' size={20} style={globalStyles.sideBar.icon}/> Logout
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}
