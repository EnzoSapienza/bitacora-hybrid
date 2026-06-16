import { Dialog, Portal, Button, Text } from "react-native-paper";

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
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Title>{title}</Dialog.Title>

                <Dialog.Content>
                    <Text>{message}</Text>
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onCancel}>Cancelar</Button>
                    <Button onPress={onConfirm} textColor="red">
                        Confirmar
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}
