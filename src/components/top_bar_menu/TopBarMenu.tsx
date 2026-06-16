import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useState } from "react";
import { Menu, IconButton } from "react-native-paper";

export default function TopBarMenu() {
    const [visible, setVisible] = useState(false);
    const { logout } = useAuth();
    const confirm = useConfirm();

    return (
        <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            style={{ marginRight: 16 }}
            anchor={
                <IconButton
                    icon="dots-vertical"
                    onPress={() => setVisible(true)}
                />
            }
        >
            <Menu.Item onPress={() => console.log("Perfil")} title="Perfil" />
            <Menu.Item
                onPress={() => {
                    console.log("Cerrando sesión");
                    confirm({
                        title: "Cerrar sesión",
                        message: "¿Seguro que quieres salir?",
                        onConfirm: logout,
                    });
                }}
                title="Cerrar sesión"
            />
        </Menu>
    );
}
