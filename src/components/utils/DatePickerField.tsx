import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';

interface DatePickerFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    currentColors: any;
}

export function DatePickerField({ label, value, onChangeText, currentColors }: DatePickerFieldProps) {
    const [show, setShow] = useState(false);

    const getInitialDate = (): Date => {
        if (!value) return new Date();
        const parts = value.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) return date;
        }
        return new Date();
    };

    return (
        <View style={styles.container}>
            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8 }]}>
                {label}
            </Text>

            <TouchableOpacity
                style={[
                    styles.pickerButton,
                    {
                        backgroundColor: currentColors.blanco,
                        borderColor: currentColors.grisClaro
                    }
                ]}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <Text style={[Typography.bodyLarge, { color: value ? currentColors.grisOscuro : currentColors.grisMedio }]}>
                    {value || "Elegir"}
                </Text>
                <MaterialIcons name="event" size={18} color={currentColors.azulProfundo} />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={getInitialDate()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onValueChange={(event, date) => {
                        setShow(false);
                        if (date) {
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            onChangeText(`${day}/${month}/${year}`);
                        }
                    }}
                    onDismiss={() => setShow(false)}
                    themeVariant={currentColors.blanco === '#FFFFFF' ? 'light' : 'dark'}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    pickerButton: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
    },
});