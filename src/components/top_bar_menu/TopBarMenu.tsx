import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useState } from "react";
import { Menu, IconButton } from "react-native-paper";
import { useTranslation } from "react-i18next";

type Props = {
    onEditProfile?: () => void;
};

export default function TopBarMenu({ onEditProfile }: Props) {
    const [visible, setVisible] = useState(false);
    const { logout } = useAuth();
    const confirm = useConfirm();
    const { t } = useTranslation();

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
            <Menu.Item
                onPress={() => {
                    setVisible(false);
                    onEditProfile?.();
                }}
                title={t('profile.editProfile')}
            />
            <Menu.Item
                onPress={() => {
                    setVisible(false);
                    confirm({
                        title: t('profile.logout'),
                        message: t('profile.confirmLogout'),
                        onConfirm: logout,
                    });
                }}
                title={t('profile.logout')}
            />
        </Menu>
    );
}