import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import PoiCard from '../poi_card/PoiCard';

interface PoiListProps {
    points: any[];
    currentColors: any;
    onPressItem: (point: any) => void;
}

export default function PoiList({ points, currentColors, onPressItem }: PoiListProps) {
    return (
        <FlatList
            data={points}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
                <PoiCard
                    point={item}
                    currentColors={currentColors}
                    onPress={() => onPressItem(item)}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: { 
        paddingBottom: 90 
    }
});