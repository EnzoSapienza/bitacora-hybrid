import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
