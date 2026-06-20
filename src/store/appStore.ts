/**
 * Almacenar de forma persistente los datos genéricos de la app
 * Ej: Darkmode, idioma, etc
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, AppState } from "react-native";
import { Themes } from "../constants/themes";

// Lo que el usuario elige
export type ThemePreference = "light" | "dark" | "system";
// Lo que se aplica realmente
type ResolvedTheme = "light" | "dark";

function resolveTheme(preference: ThemePreference): ResolvedTheme {
    if (preference === "system") {
        return Appearance.getColorScheme() === "dark" ? "dark" : "light";
    }
    return preference;
}

interface AppStoreState {
    themePreference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    themescolors: typeof Themes.light;

    setThemePreference: (preference: ThemePreference) => void;
    syncWithSystem: () => void;
}

export const useAppStore = create<AppStoreState>()(
    persist(
        (set, get) => ({
            themePreference: "system",
            resolvedTheme: resolveTheme("system"),
            themescolors: Themes[resolveTheme("system")],

            setThemePreference: (preference) => {
                const resolved = resolveTheme(preference);
                set({
                    themePreference: preference,
                    resolvedTheme: resolved,
                    themescolors: Themes[resolved],
                });
            },

            syncWithSystem: () => {
                if (get().themePreference === "system") {
                    const resolved = resolveTheme("system");
                    set({ resolvedTheme: resolved, themescolors: Themes[resolved] });
                }
            },
        }),
        {
            name: "bitacora-app-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                themePreference: state.themePreference,
            }),
        }
    )
);

// Escucha cambios de tema del SO en caliente (mientras la app está abierta)
Appearance.addChangeListener(({ colorScheme }) => {
    console.log("APPEARANCE CHANGE:", colorScheme);
    useAppStore.getState().syncWithSystem();
});

// Respaldo: si el SO no avisó el cambio (pasa en algunos Android),
// igual se sincroniza al volver del background
AppState.addEventListener("change", (state) => {
    if (state === "active") {
        console.log("APP ACTIVA, SO:", Appearance.getColorScheme());
        useAppStore.getState().syncWithSystem();
    }
});