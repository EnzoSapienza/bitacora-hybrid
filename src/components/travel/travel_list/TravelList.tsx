import { View, StyleSheet, FlatList } from "react-native";
import Travel from "@/types/models/travel";
import TravelCard from "../travel_card/TravelCard";

type Props = {
    travels: Travel[];
    onPressItem: (travel: Travel) => void;
    scrollEnabled?: boolean;
    noPadding?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    ListFooterComponent?: React.ReactElement | null;
};

export default function TravelList({
    travels,
    onPressItem,
    scrollEnabled = true,
    noPadding = false,
    onEndReached,
    onEndReachedThreshold = 0.4,
    ListFooterComponent,
}: Props) {
    return (
        <View style={styles.container}>
            <FlatList
                data={travels}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TravelCard
                        travel={item}
                        onPress={() => onPressItem(item)}
                    />
                )}
                contentContainerStyle={[
                    styles.content,
                    noPadding && styles.noHorizontalPadding,
                ]}
                scrollEnabled={scrollEnabled}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    noHorizontalPadding: {
        paddingHorizontal: 0,
    },
});