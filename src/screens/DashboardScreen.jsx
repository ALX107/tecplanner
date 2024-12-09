import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native'; // Importar useIsFocused
import app from '../utils/firebase'; // Configuración de Firebase

const DashboardScreen = ({ navigation }) => {
    const [userName, setUserName] = useState(''); // Estado para almacenar el nombre del usuario
    const db = getFirestore(app); // Inicializa Firestore
    const isFocused = useIsFocused(); // Detecta si la pantalla está activa

    // Función para cerrar sesión
    const logout = () => {
        const auth = getAuth(app);
        signOut(auth)
            .then(() => {
                Alert.alert(
                    "Cierre de Sesión",
                    "Has cerrado sesión exitosamente.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.replace("Auth"), // Redirige al login
                        },
                    ]
                );
            })
            .catch((error) => {
                Alert.alert(
                    "Error",
                    "Ocurrió un problema al cerrar sesión. Intenta nuevamente."
                );
                console.error(error);
            });
    };

    // Confirmar cierre de sesión
    const confirmLogout = () => {
        Alert.alert(
            "Confirmar Cierre de Sesión",
            "¿Estás seguro de que deseas cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Cerrar Sesión", onPress: logout, style: "destructive" },
            ]
        );
    };

    // Cargar datos del usuario desde Firestore
    const fetchUserName = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            try {
                const userDoc = doc(db, 'users', user.uid); // Asume que los documentos están indexados por UID
                const userSnap = await getDoc(userDoc);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUserName(userData.name || 'Usuario'); // Usa 'name' o un campo adecuado de tu colección
                } else {
                    console.error('El documento del usuario no existe');
                    setUserName('Usuario');
                }
            } catch (error) {
                console.error('Error al obtener el nombre del usuario desde Firestore:', error);
                setUserName('Usuario');
            }
        }
    };


    // Efecto para cargar datos cuando la pantalla está activa
    useEffect(() => {
        if (isFocused) {
            fetchUserName();
        }
    }, [isFocused]);

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

            <TouchableOpacity
                style={styles.buttonLogout}
                onPress={confirmLogout} // Llama a la función de confirmación
            >
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
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
    buttonLogout: {
        backgroundColor: '#FF4D4D',
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
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        elevation: 3,
        alignItems: 'center',
    },
    statsTitle: {
        fontSize: 18,
        color: '#34495e',
        marginBottom: 5,
    },
    statsValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
});

export default DashboardScreen;