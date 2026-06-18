import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { Image } from 'expo-image';

interface ImagePlaceholderProps {
    currentColors: any;
    height?: DimensionValue;
    backgroundColor?: string;
    padding?: number;
}

export default function ImagePlaceholder({ 
    currentColors, 
    height = '100%', 
    backgroundColor,
    padding = 24
}: ImagePlaceholderProps) {
    return (
        <View style={[
            styles.fallbackContainer, 
            { 
                height, 
                backgroundColor: backgroundColor || currentColors.grisPlaceholder,
                padding
            }
        ]}>
            <Image
                source={require('../../../assets/placeholder.svg')}
                style={styles.placeholderSvg}
                contentFit="contain"
                transition={150}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fallbackContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeholderSvg: {
        width: '100%',
        height: '100%',
        flex: 1,
        opacity: 0.45
    }
});