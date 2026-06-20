import { StyleSheet, TouchableOpacity } from "react-native";
import { useAppStore } from "@/store/appStore";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
    onPress: () => void;
};

export default function AddButton({ onPress }: Props) {
    const colors = useAppStore((s) => s.themescolors);

    return (
        <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.azulProfundo }]}
            onPress={onPress}
        >
            <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});