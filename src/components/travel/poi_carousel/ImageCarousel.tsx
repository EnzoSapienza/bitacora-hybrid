import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';

const { width: windowWidth } = Dimensions.get('window');

interface ImageCarouselProps {
    images: string[];
    height?: number;
}

export function ImageCarousel({ images, height = 250 }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / windowWidth);
        setActiveIndex(index);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { height }]}>
            <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                snapToAlignment="center"
                renderItem={({ item }) => (
                    <View style={[styles.imageContainer, { height }]}>
                        <Image
                            source={{ uri: item }}
                            style={styles.image}
                            contentFit="cover"
                            transition={200}
                        />
                    </View>
                )}
            />

            {images.length > 1 && (
                <View style={styles.indicatorContainer}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === activeIndex ? styles.indicatorActive : styles.indicatorInactive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: windowWidth,
        position: 'relative',
    },
    imageContainer: {
        width: windowWidth,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    indicatorContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        gap: 6,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
    },
    indicatorActive: {
        width: 18,
        backgroundColor: '#FFFFFF',
    },
    indicatorInactive: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
});