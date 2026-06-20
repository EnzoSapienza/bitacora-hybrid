import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { authService } from "./src/services/authService";
import { useAuthStore } from "./src/store/authStore";
import RootNavigator from "./src/navigation/RootNavigator";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { ConfirmProvider } from "@/context/confirm/ConfirmProvider";
import { useAppStore } from "./src/store/appStore";

function AppContent() {
    const resolvedTheme = useAppStore((s) => s.resolvedTheme);

    console.log("TEMA ACTUAL:", resolvedTheme);
    const paperTheme = resolvedTheme === "dark" ? MD3DarkTheme : MD3LightTheme;

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
        <SafeAreaProvider>
            <AppContent />
        </SafeAreaProvider>
    );
}