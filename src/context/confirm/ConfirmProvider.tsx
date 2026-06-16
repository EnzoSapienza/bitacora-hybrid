import React, { useState } from "react";
import { ConfirmContext, ConfirmOptions } from "./ConfirmContext";
import ConfirmDialog from "@/components/confirm_dialog/ConfirmDialog";

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);

    const confirm = (opts: ConfirmOptions) => {
        setOptions(opts);
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
        setOptions(null);
    };

    const handleConfirm = () => {
        options?.onConfirm();
        handleCancel();
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <ConfirmDialog
                visible={visible}
                title={options?.title ?? ""}
                message={options?.message ?? ""}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
            />
        </ConfirmContext.Provider>
    );
}
