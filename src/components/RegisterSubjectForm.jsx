import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { query, where, getDocs, collection, addDoc, getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../utils/firebase';

const RegisterSubjectForm = ({ onAddSubject }) => {
    const db = getFirestore(app); // Firestore
    const auth = getAuth(app); // Auth
    const [newMateria, setNewMateria] = useState({
        nombre: '',
        calificaciones: [],
        codigo: '',
        docente: '',
        semestre: '1º semestre',
        userId: '', // Será dinámico
    });

    // Validar si el código es único
    const validarCodigoUnico = async (codigo) => {
        try {
            const userId = auth.currentUser?.uid; // UID del usuario
            if (!userId) {
                Alert.alert('Error', 'Usuario no autenticado.');
                return false;
            }

            const q = query(
                collection(db, 'materias'),
                where('userId', '==', userId),
                where('codigo', '==', codigo)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.empty; // Devuelve true si no hay conflictos
        } catch (error) {
            console.error('Error al validar el código único:', error);
            return false;
        }
    };

    let isAdding = false;

const agregarMateria = async () => {
    if (isAdding) {
        console.log('Ya se está procesando una inserción. Cancelando.');
        return;
    }

    isAdding = true;

    const userId = auth.currentUser?.uid;

    if (!userId) {
        Alert.alert('Error', 'Usuario no autenticado.');
        isAdding = false;
        return;
    }

    if (
        !newMateria.nombre.trim() ||
        !newMateria.codigo.trim() ||
        !newMateria.docente.trim() ||
        !newMateria.semestre.trim()
    ) {
        Alert.alert('Error', 'Todos los campos son obligatorios.');
        isAdding = false;
        return;
    }

    const codigoEsUnico = await validarCodigoUnico(newMateria.codigo);
    if (!codigoEsUnico) {
        Alert.alert('Error', 'El código ya existe. Por favor, usa un código único.');
        isAdding = false;
        return;
    }

    try {
        const datosParaFirestore = {
            nombre: newMateria.nombre.trim(),
            calificaciones: [],
            codigo: newMateria.codigo.trim(),
            docente: newMateria.docente.trim(),
            semestre: newMateria.semestre.trim(),
            userId,
        };

        const docRef = await addDoc(collection(db, 'materias'), datosParaFirestore);
        console.log('Materia agregada con ID:', docRef.id);

        await actualizarPromedioGeneral(userId);

        onAddSubject({ ...datosParaFirestore, id: docRef.id });

        setNewMateria({
            nombre: '',
            calificaciones: [],
            codigo: '',
            docente: '',
            semestre: '1º semestre',
        });
    } catch (error) {
        Alert.alert('Error', `No se pudo agregar la materia: ${error.message}`);
    } finally {
        isAdding = false;
    }
};
      
    
    const handleCodigoChange = (text) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setNewMateria({ ...newMateria, codigo: numericValue });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registrar Materias</Text>

            <TextInput
                style={styles.input}
                placeholder="Código del curso"
                value={newMateria.codigo}
                keyboardType="numeric"
                onChangeText={handleCodigoChange}
            />

            <TextInput
                style={styles.input}
                placeholder="Nombre de la materia"
                value={newMateria.nombre}
                onChangeText={(text) => setNewMateria({ ...newMateria, nombre: text })}
            />

            <TextInput
                style={styles.input}
                placeholder="Docente"
                value={newMateria.docente}
                onChangeText={(text) => setNewMateria({ ...newMateria, docente: text })}
            />

            <Text style={styles.pickerLabel}>Selecciona el Semestre</Text>
            <Picker
                selectedValue={newMateria.semestre}
                onValueChange={(itemValue) => setNewMateria({ ...newMateria, semestre: itemValue })}
                style={styles.picker}
            >
                {[...Array(10)].map((_, index) => (
                    <Picker.Item
                        key={index}
                        label={`${index + 1}º semestre`}
                        value={`${index + 1}º semestre`}
                    />
                ))}
            </Picker>

            <Button title="Agregar Materia" onPress={agregarMateria} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#eaf4f4',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a535c',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        borderColor: '#4ecdc4',
        borderWidth: 2,
        width: '90%',
        fontSize: 16,
        color: '#333',
    },
    picker: {
        height: 50,
        width: '90%',
        backgroundColor: '#ffffff',
        marginVertical: 10,
        borderRadius: 10,
        borderColor: '#4ecdc4',
        borderWidth: 2,
        justifyContent: 'center',
    },
    pickerLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a535c',
        marginVertical: 10,
        textAlign: 'center',
    },
});

export default RegisterSubjectForm;
