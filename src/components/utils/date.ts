import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const getTimeSinceText = (updatedAt?: string | Date) => {
    if (!updatedAt) return null;

    return formatDistanceToNow(new Date(updatedAt), {
        addSuffix: false,
        locale: es,
    }).toUpperCase();
};

export { getTimeSinceText };