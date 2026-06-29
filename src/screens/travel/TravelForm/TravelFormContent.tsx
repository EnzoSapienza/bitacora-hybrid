import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Typography } from "../../../constants/typography";
import { Dispatch, SetStateAction } from "react";
import { DatePickerField } from "@/components/datetime_field/DatePickerField";

interface TravelFormContentProps {
    currentColors: any;
    name: string;
    setName: (text: string) => void;
    description: string;
    setDescription: (text: string) => void;
    startDateStr: string;
    setStartDateStr: (text: string) => void;
    endDateStr: string;
    setEndDateStr: (text: string) => void;
    visibility: "PRIVATE" | "PUBLIC" | "FOLLOWERS";
    setVisibility: Dispatch<SetStateAction<"PRIVATE" | "PUBLIC" | "FOLLOWERS">>;
    imageUrl: string | null;
    handlePickImages: () => void;
    dateError: string | null;
}

export function TravelFormContent({
    currentColors,
    name,
    setName,
    description,
    setDescription,
    startDateStr,
    setStartDateStr,
    endDateStr,
    setEndDateStr,
    visibility,
    setVisibility,
    imageUrl,
    handlePickImages,
    dateError,
}: TravelFormContentProps) {
    const { t } = useTranslation();

    const VISIBILITY_OPTIONS = [
        {
            value: "PRIVATE",
            label: t("travel.form.visibilityOptions.private"),
            icon: "lock",
        },
        {
            value: "FOLLOWERS",
            label: t("travel.form.visibilityOptions.followers"),
            icon: "people",
        },
        {
            value: "PUBLIC",
            label: t("travel.form.visibilityOptions.public"),
            icon: "public",
        },
    ] as const;

    return (
        <View style={styles.container}>
            {imageUrl ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={imageUrl}
                        style={styles.previewImage}
                        transition={200}
                    />
                    <TouchableOpacity
                        style={[
                            styles.removeButton,
                            { backgroundColor: currentColors.rojoPin },
                        ]}
                        onPress={handlePickImages}
                    >
                        <Text
                            style={[
                                Typography.labelLarge,
                                { color: "#FFFFFF" },
                            ]}
                        >
                            {t("travel.form.changePhoto")}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.uploadContainer,
                        {
                            backgroundColor: currentColors.blanco,
                            borderColor: currentColors.grisClaro,
                        },
                    ]}
                    onPress={handlePickImages}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="photo-camera"
                        size={38}
                        color={currentColors.grisMedio}
                        style={{ marginBottom: 8 }}
                    />
                    <Text
                        style={[
                            Typography.bodyLarge,
                            {
                                color: currentColors.grisMedio,
                                fontWeight: "600",
                            },
                        ]}
                    >
                        {t("travel.form.addCoverPhoto")}
                    </Text>
                </TouchableOpacity>
            )}

            <Text
                style={[
                    Typography.labelLarge,
                    {
                        color: currentColors.azulOscuro,
                        marginBottom: 8,
                        marginTop: 24,
                    },
                ]}
            >
                {t("travel.form.nameLabel")}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: currentColors.blanco,
                        color: currentColors.grisOscuro,
                        borderColor: currentColors.grisClaro,
                    },
                ]}
                placeholder={t("travel.form.namePlaceholder")}
                placeholderTextColor={currentColors.grisMedio}
                maxLength={100}
                value={name}
                onChangeText={setName}
            />

            <Text
                style={[
                    Typography.labelLarge,
                    {
                        color: currentColors.azulOscuro,
                        marginBottom: 8,
                        marginTop: 16,
                    },
                ]}
            >
                {t("travel.form.descriptionLabel")}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    styles.textArea,
                    {
                        backgroundColor: currentColors.blanco,
                        color: currentColors.grisOscuro,
                        borderColor: currentColors.grisClaro,
                    },
                ]}
                placeholder={t("travel.form.descriptionPlaceholder")}
                placeholderTextColor={currentColors.grisMedio}
                multiline
                numberOfLines={4}
                maxLength={300}
                value={description}
                onChangeText={setDescription}
            />
            <Text
                style={[styles.charCounter, { color: currentColors.grisMedio }]}
            >
                {description.length} / 300
            </Text>

            <View style={[styles.row, { marginTop: 8 }]}>
                <DatePickerField
                    label={t("travel.form.startDateLabel")}
                    value={startDateStr}
                    onChangeText={setStartDateStr}
                    currentColors={currentColors}
                />
                <View style={{ width: 12 }} />
                <DatePickerField
                    label={t("travel.form.endDateLabel")}
                    value={endDateStr}
                    onChangeText={setEndDateStr}
                    currentColors={currentColors}
                />
            </View>

            {dateError && (
                <Text
                    style={[
                        Typography.labelSmall,
                        {
                            color: currentColors.rojoPin,
                            marginTop: 6,
                            fontWeight: "500",
                        },
                    ]}
                >
                    {dateError}
                </Text>
            )}

            <Text
                style={[
                    Typography.labelLarge,
                    {
                        color: currentColors.azulOscuro,
                        marginBottom: 8,
                        marginTop: 16,
                    },
                ]}
            >
                {t("travel.form.visibilityLabel")}
            </Text>
            <View style={styles.row}>
                {VISIBILITY_OPTIONS.map((option, index) => {
                    const isSelected = visibility === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.selectorButton,
                                {
                                    backgroundColor: isSelected
                                        ? currentColors.azulProfundo
                                        : currentColors.blanco,
                                    borderColor: isSelected
                                        ? currentColors.azulProfundo
                                        : currentColors.grisClaro,
                                    marginLeft: index > 0 ? 8 : 0,
                                },
                            ]}
                            onPress={() => setVisibility(option.value)}
                        >
                            <View style={styles.buttonInnerRow}>
                                <MaterialIcons
                                    name={option.icon as any}
                                    size={16}
                                    color={
                                        isSelected
                                            ? currentColors.blanco
                                            : currentColors.azulProfundo
                                    }
                                />
                                <Text
                                    style={[
                                        Typography.labelSmall,
                                        {
                                            color: isSelected
                                                ? currentColors.blanco
                                                : currentColors.azulProfundo,
                                            marginLeft: 6,
                                        },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: "100%" },
    input: { borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1 },
    textArea: { height: 100, textAlignVertical: "top" },
    charCounter: {
        textAlign: "right",
        fontSize: 11,
        marginTop: 4,
        marginRight: 4,
    },
    row: { flexDirection: "row" },
    selectorButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonInnerRow: { flexDirection: "row", alignItems: "center" },
    uploadContainer: {
        width: "100%",
        height: 160,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginTop: 4,
    },
    imageContainer: { width: "100%", alignItems: "center" },
    previewImage: { width: "100%", height: 180, borderRadius: 8 },
    removeButton: {
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
});
