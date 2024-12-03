import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react'
import app from '../utils/firebase'
import { validateEmail } from '../utils/validation'
export default function LoginForm({ changeForm }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    }) //declarar una variable donde le aisgno un objeto con 3 atributos

    const [formErrors, setFormErrors] = useState({})
    const login = () => {
        let errors = {}
        if (!formData.email || !formData.password) { //si no hay nada en los campos
            //console.log('Un campo esta vacio')
            if (!formData.email) errors.email = true
            if (!formData.password) errors.password = true
        } else if (!validateEmail(formData.email)) { //que el correo esté escrito correctamente
            errors.email = true
        }
        else { //si no hay errores
            console.log(formData)

            const auth = getAuth(app);
            signInWithEmailAndPassword(auth, formData.email, formData.password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                });
        }
        setFormErrors(errors) //se asignen errores a form errors
        // console.log(errors)
    }

    return (
        <>
            <Text style={styles.title}>Ingrese sus credenciales</Text>
            <TextInput
                style={[styles.input, formErrors.email && styles.error]} //si no existe email ponemos borde en rojo(&& se usa si se cumple una condición, pero no tiene else (es un if sin else))
                placeholder='Correo electrónico'
                placeholderTextColor={'gray'}
                onChange={(e) => setFormData({ ...formData, email: e.nativeEvent.text })} //se guarda lo que escribí en textinput en setFormData en la propiedad email
            />
            <TextInput
                style={[styles.input, formErrors.password && styles.error]}
                placeholder='Contraseña'
                placeholderTextColor={'gray'}
                secureTextEntry
                onChange={(e) => setFormData({ ...formData, password: e.nativeEvent.text })}
            />
            <View style={styles.register}>
                <TouchableOpacity >
                    <Text style={styles.btnText} onPress={changeForm} > REGÍSTRATE </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={login} >
                    <Text style={styles.btnText}> INICIAR SESIÓN </Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        marginBottom: 25,
        marginTop: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1E3040',
        textShadowColor: 'rgba(0, 0, 0, 0.3)', // Sombra del texto
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    input: {
        borderWidth: 1.5,
        borderColor: 'black',
        backgroundColor: '#f8f9fa', // Fondo claro en los inputs
        padding: 15,
        marginBottom: 15, // Espaciado más grande
        borderRadius: 30,
        fontSize: 18,
        width: '85%',
        height: 55,
        paddingHorizontal: 20,
        alignSelf: 'center',
        shadowColor: '#000', // Sombra para mayor profundidad
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    error: {
        borderColor: '#ff4d4d', // Rojo más vibrante
        borderWidth: 2,
        backgroundColor: '#ffe6e6', // Fondo tenue para resaltar errores
    },
    register: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 20,
        alignItems: 'center', // Centra los botones
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20, // Tamaño más grande
        textAlign: 'center',
        padding: 12,
        backgroundColor: '#1E3040',
        borderRadius: 50, // Botones redondeados
        marginTop: 15,
        width: '85%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        textTransform: 'uppercase', // Todo en mayúsculas
        letterSpacing: 2, // Espaciado entre letras
    },
});
