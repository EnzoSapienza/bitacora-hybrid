import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Typography } from "../../constants/typography";

interface DatePickerFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    currentColors: any;
}

export function DatePickerField({
    label,
    value,
    onChangeText,
    currentColors,
}: DatePickerFieldProps) {
    const toInputValue = (v: string): string => {
        if (!v) return "";
        const parts = v.split("/");
        if (parts.length !== 3) return "";
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const toDisplayValue = (isoValue: string): string => {
        if (!isoValue) return "";
        const [year, month, day] = isoValue.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleChange = (event: any) => {
        onChangeText(toDisplayValue(event.target.value));
    };

    const dateInput = React.createElement("input", {
        type: "date",
        value: toInputValue(value),
        onChange: handleChange,
        style: {
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 16,
            fontFamily: "inherit",
            color: value ? currentColors.grisOscuro : currentColors.grisMedio,
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
                {dateInput}
                <MaterialIcons
                    name="event"
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
