import { formatDistanceToNow, format } from "date-fns";
import { es, enUS, it } from "date-fns/locale";

const dateLocales = { es, en: enUS, it };

function getLocale(language: string) {
    return dateLocales[language as keyof typeof dateLocales] || es;
}

const getTimeSinceText = (updatedAt: string | Date | undefined, language: string) => {
    if (!updatedAt) return null;

    return formatDistanceToNow(new Date(updatedAt), {
        addSuffix: false,
        locale: getLocale(language),
    }).toUpperCase();
};

const getTravelStatus = (
    startDate: Date,
    endDate: Date,
    colors: any,
    t: (key: string) => string
) => {
    const now = new Date();
    if (now < startDate) {
        return { label: t("travel.status.planning"), color: colors.azulProfundo };
    }
    if (now >= startDate && now <= endDate) {
        return { label: t("travel.status.ongoing"), color: colors.verdeMentaTexto };
    }
    return { label: t("travel.status.finished"), color: colors.grisMedio };
};

export const formatDateLocalized = (date: Date, language: string) => {
    return format(date, "P", { locale: getLocale(language) });
};

export const formatTimeLocalized = (date: Date, language: string) => {
    return format(date, "p", { locale: getLocale(language) });
};

export { getTimeSinceText, getTravelStatus };

export const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
};

export const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

export const calcDurationDays = (start: Date, end: Date): number =>
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

export const parseDateTimeToDate = (dateStr: string, timeStr: string): Date | null => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    if (isNaN(day) || isNaN(hour)) return null;
    return new Date(year, month - 1, day, hour, minute);
};

const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const formatShortBadgeDate = (date: Date, t: (key: string) => string) => {
    const monthKey = monthKeys[date.getMonth()];
    return `${t(`common.months.${monthKey}`)} ${date.getDate()}`;
};