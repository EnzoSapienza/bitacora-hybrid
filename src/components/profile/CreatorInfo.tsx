import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';

interface Props {
    nombre: string;
    username: string;
    photoUrl?: string;
    onPress: () => void;
}

export const CreatorInfo = ({ nombre, username, photoUrl, onPress }: Props) => {
    const colors = useAppStore((s) => s.themescolors);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
                <View style={styles.avatar}>
                    <ImagePlaceholder currentColors={colors} height={40} padding={10} />
                </View>
            )}
            <View style={styles.info}>
                <Text style={[Typography.labelLarge, { color: colors.azulOscuro }]}>{nombre}</Text>
                <Text style={[Typography.bodyMedium, { color: colors.grisMedio }]}>@{username}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
    avatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
    info: { marginLeft: 12 },
});