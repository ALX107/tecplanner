import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from "react-native";
import { getAuth, updatePassword, deleteUser } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ThemeContext } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null); // Datos del usuario
  const [newName, setNewName] = useState(""); // Campo de nombre
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const auth = getAuth();
  const db = getFirestore();

  // Cargar datos del usuario desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, 'users', auth.currentUser.uid); // Documento del usuario
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          setUserData(userSnap.data()); // Almacenar datos del usuario
        } else {
          console.log("No se encontraron datos para este usuario");
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  // Actualizar nombre
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setMessage("El nombre no puede estar vacío.");
      return;
    }

    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDoc, { name: newName });
      setUserData({ ...userData, name: newName }); // Actualiza el estado local
      setMessage("Nombre actualizado correctamente.");
      setNewName(""); // Limpia el campo
      Alert.alert("Éxito", "Los cambios fueron exitosos.", [
        { text: "OK", onPress: () => navigation.goBack() }, // Regresa al Dashboard
      ]);
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
      setMessage("Hubo un error al actualizar el nombre.");
    }
  };

  // Cambiar contraseña
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

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid)); // Borra datos en Firestore
      await deleteUser(auth.currentUser); // Elimina cuenta en Firebase Authentication
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

  // Confirmación antes de eliminar cuenta
  const confirmDeleteAccount = () => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: handleDeleteAccount, style: "destructive" },
      ]
    );
  };

  // Mostrar pantalla de carga mientras se obtienen los datos
  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando datos del perfil...</Text>
      </View>
    );
  }

  return (
    <View style={isDarkMode ? styles.darkContainer : styles.lightContainer}>
      <Text style={styles.title}>Perfil del Usuario</Text>
      <Text style={styles.info}>Nombre: {userData.name}</Text>
      <Text style={styles.info}>Correo: {userData.email}</Text>
      <Text style={styles.info}>Tareas Completadas: {userData.tasksCompleted || 0}</Text>
      <Text style={styles.info}>Promedio General: {userData.averageGrade || "N/A"}</Text>

      {/* Actualizar Nombre */}
      <Text style={styles.subtitle}>Actualizar Nombre:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nuevo nombre"
        value={newName}
        onChangeText={setNewName}
      />
      <Button title="Actualizar Nombre" onPress={handleUpdateName} />

      {/* Mensaje de confirmación o error */}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {/* Cambiar Contraseña */}
      <Text style={styles.subtitle}>Cambiar Contraseña:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <Button title="Actualizar Contraseña" onPress={handleChangePassword} />

      {/* Eliminar Cuenta */}
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
  },
  lightContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 20,
  },
});

export default ProfileScreen;
