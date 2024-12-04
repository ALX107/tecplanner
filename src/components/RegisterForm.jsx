import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import app from '../utils/firebase';
import { validateEmail } from '../utils/validation';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function RegisterForm({ changeForm }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const auth = getAuth(app);
    const db = getFirestore(app);

    const checkIfEmailExists = async (email) => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));

        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                console.log("El correo ya está registrado.");
                return true; // Retorna true si el correo ya existe
            } else {
                console.log("El correo no está registrado.");
                return false; // Retorna false si el correo no existe
            }
        } catch (error) {
            console.error("Error buscando el correo:", error);
            return false; // Retorna false en caso de error
        }
    };

    const register = async () => {
        let errors = {};
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            if (!formData.email) {
                errors.email = true;
                Alert.alert("Ingresar correo", "Por favor, ingrese su correo electrónico.");
            }
            if (!formData.password) {
                errors.password = true;
                Alert.alert("Ingresar contraseña", "Por favor, ingrese su contraseña.");
            }
            if (!formData.confirmPassword) {
                errors.confirmPassword = true;
                Alert.alert("Ingresar contraseña de confirmación", "Por favor, confirme su contraseña.");
            }
        } else if (!validateEmail(formData.email)) {
            errors.email = true;
            Alert.alert("Correo incorrecto", "El formato del correo electrónico no es válido.");
        } else if (formData.password !== formData.confirmPassword) {
            errors.password = true;
            errors.confirmPassword = true;
            Alert.alert("Contraseñas distintas", "Las contraseñas no coinciden.");
        } else if (formData.password.length < 6) {
            errors.password = true;
            errors.confirmPassword = true;
            Alert.alert("Formato de contraseña incorrecto", "Recuerda que la contraseña debe tener al menos 6 caracteres.");
        } else {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Crear el documento del usuario en Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    name: 'Nuevo Usuario',
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    isDarkMode: false,
                    tasksCompleted: 0,
                    averageGrade: null,
                });

                console.log('Usuario registrado y guardado en Firestore');
                Alert.alert("Registro exitoso", "Usuario registrado correctamente.");
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert("Correo ya registrado", "El correo electrónico ya está en uso.");
                } else {
                    console.error('Error al registrar el usuario:', error);
                    Alert.alert("Error al registrar", "Hubo un problema al registrar el usuario.");
                }
            }
        }

        setFormErrors(errors);
    };


    return (
        <>
            <Text style={styles.title}>Ingrese sus datos</Text>
            <TextInput
                style={[styles.input, formErrors.email && styles.error]}
                placeholder="Correo electrónico"
                placeholderTextColor="gray"
                onChange={(e) =>
                    setFormData({ ...formData, email: e.nativeEvent.text })
                }
            />
            <TextInput
                style={[styles.input, formErrors.password && styles.error]}
                placeholder="Contraseña"
                placeholderTextColor="gray"
                secureTextEntry
                onChange={(e) =>
                    setFormData({ ...formData, password: e.nativeEvent.text })
                }
            />
            <TextInput
                style={[styles.input, formErrors.confirmPassword && styles.error]}
                placeholder="Confirmar contraseña"
                placeholderTextColor="gray"
                secureTextEntry
                onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.nativeEvent.text })
                }
            />
            <View style={styles.register}>
                <TouchableOpacity onPress={register}>
                    <Text style={styles.btnText}> REGÍSTRATE </Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.btnText} onPress={changeForm}> INICIAR SESIÓN </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        marginBottom: 25,
        marginTop: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1E3040',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    input: {
        borderWidth: 1.5,
        borderColor: 'black',
        backgroundColor: '#f8f9fa',
        padding: 15,
        marginBottom: 15,
        borderRadius: 30,
        fontSize: 18,
        width: '85%',
        height: 55,
        paddingHorizontal: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    error: {
        borderColor: '#ff4d4d',
        borderWidth: 2,
        backgroundColor: '#ffe6e6',
    },
    register: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 20,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        padding: 12,
        backgroundColor: '#1E3040',
        borderRadius: 50,
        marginTop: 15,
        width: '85%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
