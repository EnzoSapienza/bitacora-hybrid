import { Dialog, Portal, Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store/appStore";

type Props = {
    visible: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmDialog({
    visible,
    title,
    message,
    onCancel,
    onConfirm,
}: Props) {
    const { t } = useTranslation();
    const colors = useAppStore((s) => s.themescolors);

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Title>{title}</Dialog.Title>

                <Dialog.Content>
                    <Text>{message}</Text>
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onCancel}>{t('common.cancel')}</Button>
                    <Button onPress={onConfirm} textColor={colors.rojoPin}>
                        {t('common.confirm')}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}