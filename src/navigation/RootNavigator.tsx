import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { theme } = useTheme();

    return (
        <NavigationContainer
            theme={theme === "dark" ? DarkTheme : DefaultTheme}
        >
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
