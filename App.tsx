import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { authService } from "./src/services/authService";
import { useAuthStore } from "./src/store/authStore";
import RootNavigator from "./src/navigation/RootNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";

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
            <ThemeProvider> 
                <RootNavigator />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
