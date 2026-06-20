import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import Travel from "@/types/models/travel";
import TravelCard from "../travel_card/TravelCard";

type Props = {
    travels: Travel[];
    onPressItem: (travel: Travel) => void;
};

export default function TravelList({ travels, onPressItem }: Props) {
    return (
        // TODO: mejorar la lista de viajes
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
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
