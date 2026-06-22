import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import { useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { Themes } from "../constants/themes";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const resolvedTheme = useAppStore((s) => s.resolvedTheme);

    const navTheme = useMemo(() => {
        const base = resolvedTheme === "dark" ? DarkTheme : DefaultTheme;
        const themeColors = Themes[resolvedTheme];
        return {
            ...base,
            colors: {
                ...base.colors,
                background: themeColors.grisFondoApp,
                card: themeColors.blanco,
                text: themeColors.negroAzulado,
                primary: themeColors.azulOscuro,
                border: themeColors.grisClaro,
            },
        };
    }, [resolvedTheme]);

    return (
        <NavigationContainer theme={navTheme}>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}