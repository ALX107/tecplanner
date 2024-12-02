import { StyleSheet, View, Image } from 'react-native';

import React, { useState } from 'react';

import LoginForm from './LoginForm'; // Formulario de login

import RegisterForm from './RegisterForm'; // Formulario de registro

export default function Auth() {

    const [isLogin, setIsLogin] = useState(true); // Cambia entre login y registro

    const changeForm = () => {

        setIsLogin(!isLogin); // Alterna entre login y registro

    };

    return (
        <View style={styles.view}>
            <Image style={styles.logo} source={require('../../assets/login.png')} />

            {isLogin ? <LoginForm changeForm={changeForm} /> : <RegisterForm changeForm={changeForm} />}
        </View>

    );

}

const styles = StyleSheet.create({

    view: {

        flex: 1,

        alignItems: 'center',

    },

    logo: {

        width: '85%',

        height: 250,

        marginTop: 50,

        marginBottom: 50,

        alignSelf: 'center',

        resizeMode: 'contain',

    },

});