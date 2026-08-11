import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '../../styles';

export default function TypeBadge({ isSet }) {
    const styles = useStyles();
    return (
        <View style={[styles.typeBadge, isSet ? styles.typeBadgeSet : styles.typeBadgeBord]}>
            <Text style={styles.typeBadgeText}>{isSet ? 'Set' : 'Bord'}</Text>
        </View>
    );
}
