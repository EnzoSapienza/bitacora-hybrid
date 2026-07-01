import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { authService } from "./src/services/authService";
import { useAuthStore } from "./src/store/authStore";
import RootNavigator from "./src/navigation/RootNavigator";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { ConfirmProvider } from "@/context/confirm/ConfirmProvider";
import { useAppStore } from "./src/store/appStore";
import { Themes } from "./src/constants/themes";
import "./src/i18n";
import * as Linking from "expo-linking";
import { navigationRef } from "./src/navigation/RootNavigator";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const buildPaperTheme = (base: typeof MD3LightTheme, colors: typeof Themes.light) => ({
    ...base,
    colors: {
        ...base.colors,
        primary: colors.azulProfundo,
        onPrimary: colors.blanco,
        secondary: colors.azulMedio,
        background: colors.grisFondoApp,
        surface: colors.blanco,
        onSurface: colors.grisOscuro,
        outline: colors.grisClaro,
        error: colors.rojoPin,
    },
});

function AppContent() {
    const resolvedTheme = useAppStore((s) => s.resolvedTheme);
    const themeColors = useAppStore((s) => s.themescolors);
    const baseTheme = resolvedTheme === "dark" ? MD3DarkTheme : MD3LightTheme;
    const paperTheme = buildPaperTheme(baseTheme, themeColors);

    useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        if (data && typeof data === 'object' && 'url' in data) {
            const url = (data as any).url;
            if (typeof url === 'string') {
                const route = url.replace("bitacorahybrid://", "");
                if (navigationRef.isReady()) {
                    Linking.openURL(url);
                }
            }
        }
    });
    return () => subscription.remove();
}, []);

    return (
        <PaperProvider theme={paperTheme}>
            <ConfirmProvider>
                <RootNavigator />
            </ConfirmProvider>
        </PaperProvider>
    );
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const setUser = useAuthStore((s) => s.setUser);
    const clearUser = useAuthStore((s) => s.clearUser);

    useEffect(() => {
        const unsubscribe = authService.subscribe((user) => {
            if (user) {
                setUser({ uid: user.uid, email: user.email! });
            } else {
                clearUser();
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppContent />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}