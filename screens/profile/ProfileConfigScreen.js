import React, {useEffect, useState} from 'react';
import {View, Text, Switch, ScrollView, TouchableOpacity} from 'react-native';
import {useStyles, useTheme} from '../../styles';
import {fetchData, updateNotificationPreferences} from '../../components/Apicalls';
import {confirmDelete} from '../../services/profileService';
import Icon from 'react-native-vector-icons/FontAwesome';
import ErrorBanner from '../../components/ui/ErrorBanner';

const NOTIF_ROWS = [
    {label: 'Vriendschapsverzoek',   pushKey: 'friendRequestPush',  emailKey: 'friendRequestEmail'},
    {label: 'Verzoek geaccepteerd',  pushKey: 'friendAcceptedPush', emailKey: 'friendAcceptedEmail'},
    {label: 'Nieuw bord (vrienden)', pushKey: 'newBoardPush',       emailKey: 'newBoardEmail'},
    {label: 'Nieuwe set (vrienden)', pushKey: 'newSetPush',         emailKey: 'newSetEmail'},
];

const ProfileConfigScreen = ({navigation, setGlobalError, setGlobalLoading}) => {
    const styles = useStyles();
    const { isDark, toggleTheme, colors } = useTheme();
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
        <View style={styles.flex1}>
            <ErrorBanner />
            <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.settingsSectionTitle}>Weergave</Text>
            <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Donkere modus</Text>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{false: colors.switchTrack, true: colors.primaryLight}}
                    thumbColor={isDark ? colors.primaryLight : colors.switchThumb}
                />
            </View>

            <Text style={styles.settingsSectionTitle}>Notificatie instellingen</Text>
                {NOTIF_ROWS.map(({label, pushKey, emailKey}) => (
                    <View key={pushKey} style={styles.settingsRow}>
                        <Text style={styles.settingsLabel}>{label}</Text>
                        <View style={{flexDirection: 'row', gap: 20}}>
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                                <Text style={{fontSize: 13, color: colors.textSecondary}}>Push</Text>
                                <Switch
                                    value={notifPrefs[pushKey] !== false}
                                    onValueChange={v => handleTogglePref(pushKey, v)}
                                    trackColor={{false: colors.switchTrack, true: colors.primaryLight}}
                                    thumbColor={notifPrefs[pushKey] !== false ? colors.primaryLight : colors.switchThumb}
                                />
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                                <Text style={{fontSize: 13, color: colors.textSecondary}}>Email</Text>
                                <Switch
                                    value={notifPrefs[emailKey] !== false}
                                    onValueChange={v => handleTogglePref(emailKey, v)}
                                    trackColor={{false: colors.switchTrack, true: colors.primaryLight}}
                                    thumbColor={notifPrefs[emailKey] !== false ? colors.primaryLight : colors.switchThumb}
                                />
                            </View>
                        </View>
                    </View>
                ))}

            <Text style={styles.settingsSectionTitle}>Account</Text>
            <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('ChangePassword')}>
                <Text style={styles.settingsLabel}>Change Password</Text>
                <Icon name="lock" size={16} color={colors.textSecondary}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => confirmDelete(setGlobalLoading, setGlobalError, navigation)}>
                <Text style={[styles.settingsLabel, styles.settingsDeleteLabel]}>Delete Account</Text>
                <Icon name="trash" size={16} color={colors.danger}/>
            </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default ProfileConfigScreen;
