import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Typography } from "@/constants/typography";
import { DatePickerField } from "@/components/datetime_field/DatePickerField";
import { TimePickerField } from "@/components/datetime_field/TimePickerField";

interface PointFormContentProps {
    currentColors: any;
    name: string;
    setName: (text: string) => void;
    address: string;
    setAddress: (text: string) => void;
    notes: string;
    setNotes: (text: string) => void;
    visitDate: Date;
    setVisitDate: (date: Date) => void;
    visitTime: Date;
    setVisitTime: (date: Date) => void;
    capturedCoords: { lat: number; lng: number } | null;
    handleCaptureLocation: () => void;
    selectedImages: string[];
    handlePickImages: () => void;
    handleRemovePhoto: (uri: string) => void;
    resolvingAddress: boolean;
    isFechaInvalida: boolean;
    rangoTexto: string;
    onOpenMapPicker: () => void;
}

const dateToString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const stringToDate = (value: string, fallback: Date): Date => {
    const parts = value.split("/");
    if (parts.length !== 3) return fallback;
    const [day, month, year] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? fallback : date;
};

export function PointFormContent({
    currentColors,
    name,
    setName,
    address,
    setAddress,
    notes,
    setNotes,
    visitDate,
    setVisitDate,
    visitTime,
    setVisitTime,
    capturedCoords,
    handleCaptureLocation,
    selectedImages,
    handlePickImages,
    handleRemovePhoto,
    resolvingAddress,
    isFechaInvalida,
    rangoTexto,
    onOpenMapPicker,
}: PointFormContentProps) {
    const { t } = useTranslation();
    const notesLength = (notes || "").length;

    return (
        <View style={styles.container}>
            <Text
                style={[
                    Typography.labelLarge,
                    {
                        color: currentColors.azulOscuro,
                        marginBottom: 8,
                        marginTop: 8,
                    },
                ]}
            >
                {t("travel.poiForm.nameLabel")}
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
                placeholder={t("travel.poiForm.namePlaceholder")}
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
                {t("travel.poiForm.addressLabel")}
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
                placeholder={t("travel.poiForm.addressPlaceholder")}
                placeholderTextColor={currentColors.grisMedio}
                maxLength={150}
                value={address}
                onChangeText={setAddress}
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
                {t("travel.poiForm.locationLabel")}
            </Text>
            <View style={styles.rowGap}>
                <TouchableOpacity
                    style={[
                        styles.halfButton,
                        {
                            backgroundColor: currentColors.blanco,
                            borderColor: capturedCoords
                                ? currentColors.azulProfundo
                                : currentColors.grisClaro,
                        },
                    ]}
                    onPress={handleCaptureLocation}
                    disabled={resolvingAddress}
                    activeOpacity={0.7}
                >
                    {resolvingAddress ? (
                        <ActivityIndicator
                            size="small"
                            color={currentColors.azulProfundo}
                            style={{ marginRight: 6 }}
                        />
                    ) : (
                        <MaterialIcons
                            name={
                                capturedCoords ? "location-on" : "my-location"
                            }
                            size={20}
                            color={
                                capturedCoords
                                    ? currentColors.azulProfundo
                                    : currentColors.grisMedio
                            }
                            style={{ marginRight: 6 }}
                        />
                    )}
                    <Text
                        style={[
                            Typography.bodyMedium,
                            {
                                color: capturedCoords
                                    ? currentColors.azulProfundo
                                    : currentColors.grisMedio,
                                fontWeight: "600",
                            },
                        ]}
                    >
                        {resolvingAddress
                            ? t("travel.poiForm.searching")
                            : t("travel.poiForm.myLocation")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.halfButton,
                        {
                            backgroundColor: currentColors.blanco,
                            borderColor: currentColors.grisClaro,
                        },
                    ]}
                    onPress={onOpenMapPicker}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="map"
                        size={20}
                        color={currentColors.grisMedio}
                        style={{ marginRight: 6 }}
                    />
                    <Text
                        style={[
                            Typography.bodyMedium,
                            {
                                color: currentColors.grisMedio,
                                fontWeight: "600",
                            },
                        ]}
                    >
                        {t("travel.poiForm.viewOnMap")}
                    </Text>
                </TouchableOpacity>
            </View>

            {!capturedCoords && (
                <Text
                    style={[
                        Typography.labelSmall,
                        {
                            color: currentColors.grisMedio,
                            marginTop: 6,
                            fontWeight: "500",
                        },
                    ]}
                >
                    {t("travel.poiForm.confirmLocationHint")}
                </Text>
            )}

            <View style={[styles.rowGap, { marginTop: 16 }]}>
                <DatePickerField
                    label={t("travel.poiForm.visitDateLabel")}
                    value={dateToString(visitDate)}
                    onChangeText={(text) =>
                        setVisitDate(stringToDate(text, visitDate))
                    }
                    currentColors={currentColors}
                />
                <TimePickerField
                    label={t("travel.poiForm.visitTimeLabel")}
                    value={visitTime}
                    onChange={setVisitTime}
                    currentColors={currentColors}
                    is24Hour={true}
                />
            </View>

            {rangoTexto ? (
                <Text
                    style={[
                        Typography.labelSmall,
                        {
                            color: currentColors.grisMedio,
                            marginTop: 6,
                            fontWeight: "500",
                        },
                    ]}
                >
                    {t("travel.poiForm.availableDatesPrefix")} {rangoTexto}
                </Text>
            ) : null}

            {isFechaInvalida && (
                <Text
                    style={[
                        Typography.labelSmall,
                        {
                            color: currentColors.rojoPin,
                            marginTop: 4,
                            fontWeight: "600",
                        },
                    ]}
                >
                    {t("travel.poiForm.dateOutOfRange")}
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
                {t("travel.poiForm.notesLabel")}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    styles.textArea,
                    {
                        backgroundColor: currentColors.blanco,
                        color: currentColors.grisOscuro,
                        borderColor:
                            notesLength >= 300
                                ? currentColors.rojoPin
                                : currentColors.grisClaro,
                    },
                ]}
                placeholder={t("travel.poiForm.notesPlaceholder")}
                placeholderTextColor={currentColors.grisMedio}
                multiline
                numberOfLines={4}
                maxLength={300}
                value={notes}
                onChangeText={setNotes}
            />
            <Text
                style={[
                    Typography.labelSmall,
                    styles.charCounter,
                    {
                        color:
                            notesLength >= 280
                                ? currentColors.rojoPin
                                : currentColors.grisMedio,
                    },
                ]}
            >
                {notesLength} / 300
            </Text>

            <Text
                style={[
                    Typography.labelLarge,
                    {
                        color: currentColors.azulOscuro,
                        marginBottom: 8,
                        marginTop: 12,
                    },
                ]}
            >
                {t("travel.poiForm.photosLabel")}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContainer}
            >
                <TouchableOpacity
                    style={[
                        styles.addPhotoButton,
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
                        size={24}
                        color={currentColors.grisMedio}
                    />
                    <Text
                        style={[
                            Typography.labelSmall,
                            {
                                color: currentColors.grisMedio,
                                fontWeight: "600",
                                marginTop: 2,
                            },
                        ]}
                    >
                        {t("travel.poiForm.addPhoto")}
                    </Text>
                </TouchableOpacity>

                {selectedImages.map((uri, index) => (
                    <View
                        key={index}
                        style={[
                            styles.photoItemContainer,
                            { borderColor: currentColors.grisClaro },
                        ]}
                    >
                        <Image
                            source={{ uri }}
                            style={styles.photoItem}
                            transition={150}
                        />
                        <TouchableOpacity
                            style={[
                                styles.removePhotoBadge,
                                {
                                    backgroundColor:
                                        currentColors.grisOscuroAzulado,
                                },
                            ]}
                            onPress={() => handleRemovePhoto(uri)}
                        >
                            <MaterialIcons
                                name="close"
                                size={14}
                                color={currentColors.grisFondoApp}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: "100%" },
    input: { borderRadius: 8, padding: 12, borderWidth: 1 },
    textArea: { height: 100, textAlignVertical: "top" },
    charCounter: { textAlign: "right", marginTop: 4, marginRight: 4 },
    rowGap: { flexDirection: "row", gap: 12 },
    halfButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    galleryContainer: { flexDirection: "row", gap: 12, paddingVertical: 4 },
    addPhotoButton: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    photoItemContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        borderWidth: 1,
    },
    photoItem: { width: "100%", height: "100%" },
    removePhotoBadge: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.85,
    },
});
