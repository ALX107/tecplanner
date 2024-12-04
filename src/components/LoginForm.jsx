import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import React from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import app from '../utils/firebase';
import { validateEmail } from '../utils/validation';

export default function LoginForm({ changeForm }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    }); // Declarar una variable donde asigno un objeto con 3 atributos

    const [formErrors, setFormErrors] = useState({});

    const login = () => {
        let errors = {};
        if (!formData.email || !formData.password) {
            if (!formData.email) {
                errors.email = true;
                Alert.alert("Ingresar correo", "Por favor, ingrese su correo electrónico.");
            }
            if (!formData.password) {
                errors.password = true;
                Alert.alert("Ingresar contraseña", "Por favor, ingrese su contraseña.");
            }
        } else if (!validateEmail(formData.email)) {
            errors.email = true;
            Alert.alert("Correo incorrecto", "El formato del correo electrónico no es válido.");
        } else if (formData.password.length < 6) {
            errors.password = true;
            Alert.alert("Contraseña incorrecta", "Recuerda que la contraseña debe tener al menos 6 caracteres.");
        } else {
            // Si no hay errores, intenta iniciar sesión
            console.log(formData);

            const auth = getAuth(app);
            signInWithEmailAndPassword(auth, formData.email, formData.password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log("Inicio de sesión exitoso", user);
                })
                .catch((error) => {
                    if (error.code === 'auth/invalid-credential') {
                        Alert.alert("Credenciales inválidas", "El correo o la contraseña son incorrectos");
                    } else {
                        console.error("Error desconocido al iniciar sesión:", error);
                        Alert.alert("Error al iniciar sesión", "Hubo un problema al iniciar sesión. Intenta de nuevo.");
                    }
                });
        }
        setFormErrors(errors); // Asigna los errores a formErrors
    };

    return (
        <>
            <Text style={styles.title}>Ingrese sus credenciales</Text>
            <TextInput
                style={[styles.input, formErrors.email && styles.error]}
                placeholder="Correo electrónico"
                placeholderTextColor="gray"
                onChange={(e) => setFormData({ ...formData, email: e.nativeEvent.text })}
            />
            <TextInput
                style={[styles.input, formErrors.password && styles.error]}
                placeholder="Contraseña"
                placeholderTextColor="gray"
                secureTextEntry
                onChange={(e) => setFormData({ ...formData, password: e.nativeEvent.text })}
            />
            <View style={styles.register}>
                <TouchableOpacity onPress={login}>
                    <Text style={styles.btnText}> INICIAR SESIÓN </Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.btnText} onPress={changeForm}> REGISTRARSE </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        marginBottom: 25,
        marginTop: 15,
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
