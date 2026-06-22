import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "./es.json";
import en from "./en.json";
import it from "./it.json";

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es },
        en: { translation: en },
        it: { translation: it },
    },
    lng: "es",
    fallbackLng: "es",
    compatibilityJSON: "v4",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;