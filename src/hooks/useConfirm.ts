import { ConfirmContext } from "@/context/confirm/ConfirmContext";
import { useContext } from "react";

export function useConfirm() {
    const context = useContext(ConfirmContext);

    if (!context) {
        throw new Error(
            "useConfirm must be used within ConfirmProvider"
        );
    }

    return context.confirm;
}