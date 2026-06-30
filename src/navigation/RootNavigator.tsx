import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
    createNavigationContainerRef,
} from "@react-navigation/native";
import { useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { Themes } from "../constants/themes";
import { linking } from "./linking";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import UsernameScreen from "../screens/auth/UsernameScreen";

export const navigationRef = createNavigationContainerRef();

export default function RootNavigator() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const needsUsername = useAuthStore((s) => s.needsUsername);
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

    let content;
    if (!isAuthenticated) {
        content = <AuthNavigator />;
    } else if (needsUsername) {
        content = <UsernameScreen />;
    } else {
        content = <AppNavigator />;
    }

    return (
        <NavigationContainer ref={navigationRef} theme={navTheme} linking={linking}>
            {content}
        </NavigationContainer>
    );
}