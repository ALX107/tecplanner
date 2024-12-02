import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react'
import app from '../utils/firebase'
import { validateEmail } from '../utils/validation'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterForm({ changeForm }) {

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    }) //declarar una variable donde le aisgno un objeto con 3 atributos

    const [formErrors, setFormErrors] = useState({})

    const register = () => {
        let errors = {}
        if (!formData.email || !formData.password || !formData.confirmPassword) { //si no hay nada en los campos
            //console.log('Un campo esta vacio')
            if (!formData.email) errors.email = true
            if (!formData.password) errors.password = true
            if (!formData.confirmPassword) errors.confirmPassword = true
        } else if (!validateEmail(formData.email)) { //que el correo esté escrito correctamente
            errors.email = true
        } else if (formData.password !== formData.confirmPassword) { //que las dos pass coincidan
            errors.password = true
            errors.confirmPassword = true
        } else if (formData.password.length < 6) { //que la pass tenga más de 6 caracteres
            errors.password = true
            errors.confirmPassword = true
        }
        else { //si no hay errores
            console.log(formData)

            const auth = getAuth(app);//traigo a app
            createUserWithEmailAndPassword(auth, formData.email, formData.password)
                .then((userCredential) => {
                    // Signed up 
                    const user = userCredential.user;
                    console.log(user)
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(error.message)
                    // ..
                });
        }
        setFormErrors(errors) //se asignen errores a form errors
        // console.log(errors)
    }

    return (
        <>
            <Text style={styles.title}>Ingrese sus datos</Text>
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
            <TextInput
                style={[styles.input, formErrors.confirmPassword && styles.error]}
                placeholder='Confirmar contraseña'
                placeholderTextColor={'gray'}
                secureTextEntry
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.nativeEvent.text })}
            />
            <View style={styles.register}>
                <TouchableOpacity onPress={register}>
                    <Text style={styles.btnText}> REGÍSTRATE </Text>
                </TouchableOpacity>

                <TouchableOpacity >
                    <Text style={styles.btnText} onPress={changeForm} > INCIAR SESIÓN </Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        marginBottom: 20,
        marginTop: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1E3040'
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        marginBottom: 10, //separar los inputs
        borderRadius: 30,
        fontSize: 18,
        width: '80%',
        height: 50,
        paddingHorizontal: 20,
        alignSelf: 'center'
    },
    error: {
        borderColor: 'red',
        borderWidth: 4,
    },
    register: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#1E3040',
        borderRadius: 30,
        marginTop: 10,
        width: '80%',
        alignSelf: 'center'
    }
})