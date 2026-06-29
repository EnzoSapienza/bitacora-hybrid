import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/typography";

interface TimePickerFieldProps {
    label: string;
    value: Date;
    onChange: (date: Date) => void;
    currentColors: any;
    is24Hour?: boolean;
}

export function TimePickerField({
    label,
    value,
    onChange,
    currentColors,
}: TimePickerFieldProps) {
    const toInputValue = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const handleChange = (event: any) => {
        const nextValue: string = event.target.value;
        if (!nextValue) return;
        const [hours, minutes] = nextValue.split(":").map(Number);
        const nextDate = new Date(value);
        nextDate.setHours(hours, minutes, 0, 0);
        onChange(nextDate);
    };

    const timeInput = React.createElement("input", {
        type: "time",
        value: toInputValue(value),
        onChange: handleChange,
        step: 60,
        style: {
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 16,
            fontFamily: "inherit",
            color: currentColors.grisOscuro,
            cursor: "pointer",
            height: "100%",
        },
    });

    return (
        <View style={styles.container}>
            <Text
                style={[
                    Typography.labelLarge,
                    { color: currentColors.azulOscuro, marginBottom: 8 },
                ]}
            >
                {label}
            </Text>

            <View
                style={[
                    styles.pickerButton,
                    {
                        backgroundColor: currentColors.blanco,
                        borderColor: currentColors.grisClaro,
                    },
                ]}
            >
                {timeInput}
                <MaterialIcons
                    name="access-time"
                    size={18}
                    color={currentColors.azulProfundo}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    pickerButton: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 50,
    },
});
