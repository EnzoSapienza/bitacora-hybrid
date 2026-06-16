import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { Themes } from '../constants/themes';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    colors: typeof Themes.light;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    colors: Themes.light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Inicialización síncrona directa con el sistema operativo
    const [theme, setTheme] = useState<Theme>(
        Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    );

    // Listener que actualiza la app en tiempo real si cambia el celular
    useEffect(() => {
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme === 'dark' ? 'dark' : 'light');
        });
        return () => sub.remove();
    }, []);

    const colors = Themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}