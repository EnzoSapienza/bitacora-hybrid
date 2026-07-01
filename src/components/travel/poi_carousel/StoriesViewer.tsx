import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import {
    GestureDetector,
    Gesture,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface StoriesViewerProps {
    visible: boolean;
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}

function ZoomableImage({ uri }: { uri: string }) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const resetZoom = () => {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = Math.max(1, savedScale.value * e.scale);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value < 1.05) {
                runOnJS(resetZoom)();
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                runOnJS(resetZoom)();
            } else {
                scale.value = withTiming(2.5);
                savedScale.value = 2.5;
            }
        });

    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        panGesture,
        doubleTapGesture,
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.image, animatedStyle]}>
                <Image
                    source={{ uri }}
                    style={styles.image}
                    contentFit="contain"
                    transition={100}
                />
            </Animated.View>
        </GestureDetector>
    );
}

export default function StoriesViewer({
    visible,
    images,
    initialIndex = 0,
    onClose,
}: StoriesViewerProps) {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        if (visible) setIndex(initialIndex);
    }, [visible, initialIndex]);

    if (!visible) return null;

    const goNext = () => {
        if (index < images.length - 1) setIndex(index + 1);
        else onClose();
    };

    const goPrev = () => {
        if (index > 0) setIndex(index - 1);
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.progressRow}>
                {images.map((_, i) => (
                    <View key={i} style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: i <= index ? '100%' : '0%' },
                            ]}
                        />
                    </View>
                ))}
            </View>

            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
                <MaterialIcons name="close" size={28} color="#FFFFFF" />
            </Pressable>

            <ZoomableImage key={index} uri={images[index]} />

            <View style={styles.tapZones} pointerEvents="box-none">
                <Pressable style={styles.tapLeft} onPress={goPrev} />
                <Pressable style={styles.tapRight} onPress={goNext} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.92)',
    },
    progressRow: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        gap: 4,
        zIndex: 10,
    },
    progressTrack: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        position: 'absolute',
        top: 24,
        right: 16,
        zIndex: 10,
    },
    image: {
        width: width,
        height: height * 0.8,
    },
    tapZones: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        flexDirection: 'row',
    },
    tapLeft: { flex: 1 },
    tapRight: { flex: 1 },
});