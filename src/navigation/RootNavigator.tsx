import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const resolvedTheme = useAppStore((s) => s.resolvedTheme);
    const colors = useAppStore((s) => s.themescolors);

    const base = resolvedTheme === "dark" ? DarkTheme : DefaultTheme;

    const navTheme = {
        ...base,
        colors: {
            ...base.colors,
            background: colors.grisFondoApp,
            card: colors.blanco,
            text: colors.negroAzulado,
            primary: colors.azulOscuro,
            border: colors.grisClaro,
        },
    };
    return (
        <NavigationContainer theme={navTheme}>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
