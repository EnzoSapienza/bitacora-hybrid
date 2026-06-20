import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import TravelList from "@/components/travel/travel_list/TravelList";
import { useTravelStore } from "@/hooks/firestore/useTravelStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import AddButton from "@/components/add_button/AddButton";

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const user = useAuthStore((state) => state.user);
    const colors = useAppStore((s) => s.themescolors);
    const { travels, loading, fetchTravels } = useTravelStore();

    useEffect(() => {
        if (user?.uid) {
            fetchTravels(user.uid);
        }
    }, [user?.uid]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color="#0D47A1" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.grisFondoApp }]}>
            <TravelList
                travels={travels}
                onPressItem={(item) => 
                    navigation.navigate("Travel", {
                        screen: "TravelDetails",
                        params: { travelId: item.id }
                    })
                }
            /> 
            <AddButton 
                onPress={() => navigation.navigate("Travel", { screen: "TravelForm" })} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    center: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center" 
    },
});