import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const getTimeSinceText = (updatedAt?: string | Date) => {
    if (!updatedAt) return null;

    return formatDistanceToNow(new Date(updatedAt), {
        addSuffix: false,
        locale: es,
    }).toUpperCase();
};

const getTravelStatus = (startDate: Date, endDate: Date, colors: any) => {
    const now = new Date();
    if (now < startDate) {
        return { label: "PLANIFICANDO", color: colors.azulProfundo };
    }
    if (now >= startDate && now <= endDate) {
        return { label: "EN CURSO", color: colors.verdeMentaTexto };
    }
    return { label: "FINALIZADO", color: colors.grisMedio };
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