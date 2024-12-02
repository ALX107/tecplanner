import { StatusBar } from 'expo-status-bar';

import { StyleSheet, View } from 'react-native';

import { useState, useEffect } from 'react';

import { getAuth, onAuthStateChanged } from "firebase/auth";

import app from './src/utils/firebase'; // Firebase configurado

import Auth from './src/components/Auth'; // Componente Auth

import ListBirthday from './src/screens/ListBirthday';
import AppNavigator from "./src/navigation/AppNavigator"; // Pantalla para usuarios autenticados

export default function App() {

  const [user, setUser] = useState(undefined);

  useEffect(() => {

    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {

      if (user) {

        setUser(true); // Usuario autenticado

      } else {

        setUser(false); // Usuario no autenticado

        console.log("Usuario no autenticado");

      }

    });

  }, []);

  // Muestra una pantalla en blanco mientras se verifica el estado del usuario

  if (user === undefined) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {user ? <AppNavigator /> : <Auth />}
    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: 'lightblue', // Fondo claro

    marginTop: 20,

  },

});