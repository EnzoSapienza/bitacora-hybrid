import { StyleSheet, TextStyle } from 'react-native';

interface TypographyStyles {
    displayLarge: TextStyle;
    headlineLarge: TextStyle;
    titleLarge: TextStyle;
    titleMedium: TextStyle;
    bodyLarge: TextStyle;
    bodyMedium: TextStyle;
    labelLarge: TextStyle;
    labelSmall: TextStyle;
}

export const Typography = StyleSheet.create<TypographyStyles>({
    displayLarge: {
        fontSize: 57,
        lineHeight: 64,
        fontWeight: '900',        // Peso Máximo / Black
        letterSpacing: -0.25,
    },
    headlineLarge: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '800',        // Peso Extra Bold
        letterSpacing: 0,
    },
    titleLarge: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',        // Peso Bold (Secciones Principales / TopBar)
        letterSpacing: 0,
    },
    titleMedium: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '700',        // Peso Bold (Subtítulos de Tarjetas)
        letterSpacing: 0.15,
    },
    bodyLarge: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',        // Peso Normal (Párrafos y Contenido Principal)
        letterSpacing: 0.5,
    },
    bodyMedium: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',        // Peso Normal (Descripciones Secundarias)
        letterSpacing: 0.25,
    },
    labelLarge: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '700',        // Peso Bold (Botones / Chips Interactivos)
        letterSpacing: 0.1,
    },
    labelSmall: {
        fontSize: 11,
        lineHeight: 16,
        fontWeight: '500',        // Peso Medium (Textos Pequeños / Fechas)
        letterSpacing: 0.5,
    },
});