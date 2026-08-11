import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStyles, useTheme } from "../../styles";
import { handleSubmitSetRating } from "../Apicalls";

/**
 * Star rating component used for rating sets.
 */
export default function RatingStars({
                                        rating,
                                        onChange,
                                        setId,
                                        setGlobalLoading,
                                        setGlobalError,
                                        readonly = false,
                                        size = 25,
                                        showLabel = true,
                                        style,
                                        setOverallRating,
                                    }) {
    const styles = useStyles();
    const { colors } = useTheme();

    const rateSet = async (value) => {

        if (readonly) return;

        try {

            const updatedOverall =
                await handleSubmitSetRating(
                    setId,
                    value,
                    setGlobalError,
                    setGlobalLoading
                );

            onChange?.(value);

            if (
                updatedOverall !== null &&
                typeof setOverallRating === 'function'
            ) {
                setOverallRating(updatedOverall);
            }

        } catch {
            setGlobalError?.("Failed to submit rating");
        }
    };

    return (
        <View style={[styles.containerSlider, style]}>

            {!readonly && showLabel &&
                <Text style={styles.labelSlider}>
                    Your Rating:
                </Text>
            }

            <View style={{ flexDirection:'row' }}>
                {[1,2,3,4,5].map(star => {

                    let iconName;

                    if (rating >= star) iconName='star';
                    else if (rating >= star-0.5) iconName='star-half';
                    else iconName='star-outline';

                    return (
                        <TouchableOpacity
                            key={star}
                            disabled={readonly}
                            onPress={()=>rateSet(star)}
                            style={{marginRight:2}}
                        >
                            <Ionicons
                                name={iconName}
                                size={size}
                                color={
                                    iconName === 'star-outline'
                                        ? colors.disabled
                                        : colors.star
                                }
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>

        </View>
    );
}