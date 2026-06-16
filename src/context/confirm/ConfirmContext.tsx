import { createContext } from "react";

export type ConfirmOptions = {
    title: string;
    message: string;
    onConfirm: () => void;
};

export type ConfirmContextType = {
    confirm: (options: ConfirmOptions) => void;
};

export const ConfirmContext = createContext<ConfirmContextType | undefined>(
    undefined,
);
