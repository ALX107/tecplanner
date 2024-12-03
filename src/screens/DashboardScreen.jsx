import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const DashboardScreen = ({ navigation }) => {
    const [userName, setUserName] = useState(''); // Estado para almacenar el nombre del usuario

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserName(user.displayName || user.email);
            }
        });

        return unsubscribe;
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/TecPlanner.png')} // Cambia esta ruta según la ubicación de tu archivo
                style={styles.logo}
            />

            <Text style={styles.title}>Bienvenido, {userName}</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Profile')}
            >
                <Text style={styles.buttonText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Tasks')}
            >
                <Text style={styles.buttonText}>Tareas</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Grades')}
            >
                <Text style={styles.buttonText}>Calificaciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Notes')}
            >
                <Text style={styles.buttonText}>Notas</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff', // Fondo claro y suave
        paddingHorizontal: 20,
    },
    logo: {
        height: '18%',
        resizeMode: 'contain', // Asegura que la imagen no se distorsione
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#34495e', // Texto oscuro moderno
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#3498db', // Azul moderno
        paddingVertical: 10, // Botones más grandes
        paddingHorizontal: 35,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 10,
        width: '85%', // Botones más amplios
        elevation: 4, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20, // Texto más grande
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default DashboardScreen;
