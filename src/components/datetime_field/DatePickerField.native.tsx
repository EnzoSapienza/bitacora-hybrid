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

interface DatePickerFieldProps {
    label: string;
    value: string; // formato "DD/MM/YYYY"
    onChangeText: (text: string) => void;
    currentColors: any;
}

export function DatePickerField({
    label,
    value,
    onChangeText,
    currentColors,
}: DatePickerFieldProps) {
    const [show, setShow] = useState(false);

    const getInitialDate = (): Date => {
        if (!value) return new Date();
        const parts = value.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) return date;
        }
        return new Date();
    };

    // El prop correcto es "onChange" (no "onValueChange").
    // En Android el picker se cierra solo; event.type === "dismissed" cuando se cancela.
    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShow(false);
        }
        if (event.type === "dismissed") return;
        if (selectedDate) {
            const day = String(selectedDate.getDate()).padStart(2, "0");
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const year = selectedDate.getFullYear();
            onChangeText(`${day}/${month}/${year}`);
        }
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
                        {
                            color: value
                                ? currentColors.grisOscuro
                                : currentColors.grisMedio,
                        },
                    ]}
                >
                    {value || "Elegir"}
                </Text>
                <MaterialIcons
                    name="event"
                    size={18}
                    color={currentColors.azulProfundo}
                />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={getInitialDate()}
                    mode="date"
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
