import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
    is24Hour = true,
}: TimePickerFieldProps) {
    const [show, setShow] = useState(false);

    const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        if (is24Hour) {
            return `${String(hours).padStart(2, "0")}:${minutes}`;
        }
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        return `${displayHours}:${minutes} ${period}`;
    };

    // El prop correcto es "onChange" (no "onValueChange").
    // En Android el picker se cierra solo; event.type === "dismissed" cuando se cancela.
    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShow(false);
        }
        if (event.type === "dismissed") return;
        if (selectedDate) onChange(selectedDate);
    };

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

            <TouchableOpacity
                style={[
                    styles.pickerButton,
                    {
                        backgroundColor: currentColors.blanco,
                        borderColor: currentColors.grisClaro,
                    },
                ]}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        Typography.bodyLarge,
                        { color: currentColors.grisOscuro },
                    ]}
                >
                    {formatTime(value)}
                </Text>
                <MaterialIcons
                    name="access-time"
                    size={18}
                    color={currentColors.azulProfundo}
                />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={value}
                    mode="time"
                    is24Hour={is24Hour}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleChange}
                    themeVariant={
                        currentColors.blanco === "#FFFFFF" ? "light" : "dark"
                    }
                />
            )}

            {/* "onDismiss" no existe en la API. En iOS, como "spinner" no se */}
            {/* autocierra, agregamos un botón explícito para cerrar el picker. */}
            {Platform.OS === "ios" && show && (
                <TouchableOpacity
                    onPress={() => setShow(false)}
                    style={styles.doneButton}
                >
                    <Text
                        style={{
                            color: currentColors.azulProfundo,
                            fontWeight: "600",
                        }}
                    >
                        Listo
                    </Text>
                </TouchableOpacity>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 50,
    },
    doneButton: {
        alignSelf: "flex-end",
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
