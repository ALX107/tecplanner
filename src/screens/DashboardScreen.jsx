import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const DashboardScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido al Dashboard</Text>
            <Button title="Perfil" onPress={() => navigation.navigate('Profile')} />
            <Button title="Tareas" onPress={() => navigation.navigate('Tasks')} />
            <Button title="Calificaciones" onPress={() => navigation.navigate('Grades')} />
            <Button title="Notas" onPress={() => navigation.navigate('Notes')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default DashboardScreen;
