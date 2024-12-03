import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from "react-native";
import { getAuth, updatePassword } from "firebase/auth";
import { deleteUser } from "firebase/auth";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { ThemeContext } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const auth = getAuth();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const db = getFirestore();
  const [stats, setStats] = useState(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);


  //useEffect que trabaja las estadisticas
  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuth();
      const db = getFirestore();
  
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        setStats(docSnap.data()); // Guardar los datos obtenidos en el estado
      } else {
        console.log('No hay datos para este usuario.');
      }
    };
  
    fetchStats();
  }, []);


  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    updatePassword(auth.currentUser, newPassword)
      .then(() => {
        setMessage("Contraseña actualizada correctamente.");
        setNewPassword("");
      })
      .catch((error) => {
        setMessage("Error al actualizar la contraseña.");
        console.error(error);
      });
  };

  const handleDeleteAccount = async () => {
    try {
      // Borra la información del usuario en Firestore
      await deleteDoc(doc(db, "users", auth.currentUser.uid));

      // Elimina la cuenta de Firebase Authentication
      await deleteUser(auth.currentUser);

      console.log("Cuenta eliminada exitosamente.");
      navigation.navigate("Auth"); // Redirige al login
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      Alert.alert(
        "Error",
        "No se pudo eliminar la cuenta. Por favor, intenta de nuevo."
      );
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: handleDeleteAccount,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={isDarkMode ? styles.darkContainer : styles.lightContainer}>
      <Text style={styles.title}>Perfil del Usuario</Text>
      <Text style={styles.info}>Correo: {auth.currentUser?.email}</Text>
      {stats && (
        <View>
          <Text>Tareas Completadas: {stats.tasksCompleted || 0}</Text>
          <Text>Promedio: {stats.averageGrade || "N/A"}</Text>
        </View>
      )}
      <Text style={styles.subtitle}>Cambiar Contraseña:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
        <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Modo Oscuro</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
      <Button title="Actualizar Contraseña" onPress={handleChangePassword} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button
        title="Eliminar Cuenta"
        color="red"
        onPress={confirmDeleteAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: "green",
  },lightContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // Fondo claro
    padding: 20,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#333333', // Fondo oscuro
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 18,
    color: '#000',
  },
});

export default ProfileScreen;
