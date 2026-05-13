import React, {useEffect, useState} from 'react';
import {View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {globalStyles} from '../../styles';
import {fetchData, updateNotificationPreferences} from '../../components/Apicalls';
import {confirmDelete} from '../../services/profileService';
import Icon from 'react-native-vector-icons/FontAwesome';

const NOTIF_ROWS = [
    {label: 'Vriendschapsverzoek',   pushKey: 'friendRequestPush',  emailKey: 'friendRequestEmail'},
    {label: 'Verzoek geaccepteerd',  pushKey: 'friendAcceptedPush', emailKey: 'friendAcceptedEmail'},
    {label: 'Nieuw bord (vrienden)', pushKey: 'newBoardPush',       emailKey: 'newBoardEmail'},
    {label: 'Nieuwe set (vrienden)', pushKey: 'newSetPush',         emailKey: 'newSetEmail'},
];

const ProfileConfigScreen = ({navigation, setGlobalError, setGlobalLoading}) => {
    const [notifPrefs, setNotifPrefs] = useState(null);

    useEffect(() => {
        setGlobalLoading(true);
        fetchData(
            (data) => setNotifPrefs(data.notificationPreferences ?? {}),
            setGlobalError,
            setGlobalLoading
        );
    }, []);

    const handleTogglePref = async (key, value) => {
        setNotifPrefs(prev => ({...prev, [key]: value}));
        await updateNotificationPreferences({[key]: value}, setGlobalError);
    };

    if (!notifPrefs) return null;

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={globalStyles.settingsSectionTitle}>Notificatie instellingen</Text>
                {NOTIF_ROWS.map(({label, pushKey, emailKey}) => (
                    <View key={pushKey} style={globalStyles.settingsRow}>
                        <Text style={globalStyles.settingsLabel}>{label}</Text>
                        <View style={styles.toggles}>
                            <View style={styles.toggle}>
                                <Text style={styles.toggleLabel}>Push</Text>
                                <Switch
                                    value={notifPrefs[pushKey] !== false}
                                    onValueChange={v => handleTogglePref(pushKey, v)}
                                    trackColor={{true: '#007bff'}}
                                />
                            </View>
                            <View style={styles.toggle}>
                                <Text style={styles.toggleLabel}>Email</Text>
                                <Switch
                                    value={notifPrefs[emailKey] !== false}
                                    onValueChange={v => handleTogglePref(emailKey, v)}
                                    trackColor={{true: '#007bff'}}
                                />
                            </View>
                        </View>
                    </View>
                ))}

            <Text style={globalStyles.settingsSectionTitle}>Account</Text>
            <TouchableOpacity style={globalStyles.settingsRow} onPress={() => navigation.navigate('ChangePassword')}>
                <Text style={globalStyles.settingsLabel}>Change Password</Text>
                <Icon name="lock" size={16} color="#444"/>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.settingsRow} onPress={() => confirmDelete(setGlobalLoading, setGlobalError, navigation)}>
                <Text style={[globalStyles.settingsLabel, globalStyles.settingsDeleteLabel]}>Delete Account</Text>
                <Icon name="trash" size={16} color="#dc3545"/>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    toggles: {
        flexDirection: 'row',
        gap: 20,
    },
    toggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    toggleLabel: {
        fontSize: 13,
        color: '#666',
    },
});

export default ProfileConfigScreen;
