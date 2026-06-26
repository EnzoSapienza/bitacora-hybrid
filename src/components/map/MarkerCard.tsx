import MapMarker from "@/types/models/MapMarker";
import { StyleSheet, View, Text } from "react-native";
import { Button, Surface } from "react-native-paper";

type Props = {
    mapMarker: MapMarker;
    onCancel: () => void;
    moreText?: string;
    onMore?: () => void;
};

export default function MarkerCard({
    mapMarker,
    onCancel,
    moreText,
    onMore,
}: Props) {
    return (
        <Surface style={styles.container} elevation={4}>
            <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={2}>
                    {mapMarker.name ?? "Lugar"}
                </Text>
                <Text style={styles.content}>{mapMarker.address ?? "A"}</Text>
            </View>
            <View style={styles.btnContainer}>
                <Button
                    style={styles.btn}
                    mode="contained"
                    onPress={onCancel}
                    compact={true}
                >
                    Cancelar
                </Button>
                {moreText && (
                    <Button
                        style={styles.btn}
                        mode="contained"
                        onPress={onMore}
                        compact={true}
                    >
                        {moreText}
                    </Button>
                )}
            </View>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "column",
        alignItems: "stretch",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    textContainer: {
        flex: 1,
        flexDirection: "column",
        marginLeft: 10,
    },
    title: {
        fontWeight: "600",
        marginBottom: 2,
        color: "white",
        fontSize: 25,
    },
    content: {
        fontSize: 16,
        color: "white",
        textAlign: "center",
    },
    btnContainer: {
        marginVertical: 20,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    btn: {
        width: 100,
    },
});
