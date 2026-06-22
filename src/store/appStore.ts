/**
 * Almacenar de forma persistente los datos genéricos de la app
 * Ej: Darkmode, idioma, etc
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, AppState } from "react-native";
import * as Localization from "expo-localization";
import i18n from "../i18n";
import { Themes } from "../constants/themes";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

export type LanguagePreference = "es" | "en" | "it" | "system";
type ResolvedLanguage = "es" | "en" | "it";

function resolveTheme(preference: ThemePreference): ResolvedTheme {
    if (preference === "system") {
        return Appearance.getColorScheme() === "dark" ? "dark" : "light";
    }
    return preference;
}

function resolveLanguage(preference: LanguagePreference): ResolvedLanguage {
    if (preference === "system") {
        const code = Localization.getLocales()[0]?.languageCode;
        if (code === "en" || code === "it") return code;
        return "es";
    }
    return preference;
}

interface AppStoreState {
    themePreference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    themescolors: typeof Themes.light;
    setThemePreference: (preference: ThemePreference) => void;
    syncWithSystem: () => void;

    languagePreference: LanguagePreference;
    resolvedLanguage: ResolvedLanguage;
    setLanguagePreference: (preference: LanguagePreference) => void;
    syncLanguageWithSystem: () => void;
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
                if (get().themePreference !== "system") return;
                const resolved = resolveTheme("system");
                if (get().resolvedTheme === resolved) return;
                set({ resolvedTheme: resolved, themescolors: Themes[resolved] });
            },

            languagePreference: "system",
            resolvedLanguage: resolveLanguage("system"),

            setLanguagePreference: (preference) => {
                const resolved = resolveLanguage(preference);
                i18n.changeLanguage(resolved);
                set({ languagePreference: preference, resolvedLanguage: resolved });
            },

            syncLanguageWithSystem: () => {
                if (get().languagePreference !== "system") return;
                const resolved = resolveLanguage("system");
                if (i18n.language === resolved) return;
                i18n.changeLanguage(resolved);
            },
        }),
        {
            name: "bitacora-app-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                themePreference: state.themePreference,
                languagePreference: state.languagePreference,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    i18n.changeLanguage(state.resolvedLanguage);
                }
            },
        }
    )
);

Appearance.addChangeListener(({ colorScheme }) => {
    useAppStore.getState().syncWithSystem();
});

AppState.addEventListener("change", (state) => {
    if (state === "active") {
        useAppStore.getState().syncWithSystem();
        useAppStore.getState().syncLanguageWithSystem();
    }
});