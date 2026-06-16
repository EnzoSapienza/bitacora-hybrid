import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TravelStackParamList } from '../../../navigation/features/TravelNavigator';
import { useTheme } from '../../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

type TravelListNavProp = NativeStackNavigationProp<TravelStackParamList, 'TravelList'>;

export default function TravelListScreen() {
    const navigation = useNavigation<TravelListNavProp>();
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.grisFondoApp }]}>
            {/* acá va la lista de viajes */}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.azulProfundo }]}
                onPress={() => navigation.navigate('TravelForm')}
            >
                <MaterialIcons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});