import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getFirestore, Timestamp } from 'firebase/firestore';

const RegisterSubjectForm = ({ onAddSubject }) => {
    const db = getFirestore(app); // Obtenemos Firestore de la configuración de Firebase
    const [newMateria, setNewMateria] = useState({
        nombre: '',
        calificaciones: [],
        codigo: '',
        docente: '',
        semestre: '1er semestre',
        tareas: {
            descripcion: '',
            fecha_entrega: Timestamp.fromDate(new Date()),
        },
    });

    // Validar si el código es único
    const validarCodigoUnico = async (codigo) => {
        try {
            const querySnapshot = await getDocs(collection(db, 'materias'));
            const codigosExistentes = querySnapshot.docs.map((doc) => doc.data().codigo);
            return !codigosExistentes.includes(codigo); // Devuelve true si el código no existe
        } catch (error) {
            console.error('Error al validar el código único:', error);
            return false;
        }
    };

    const agregarMateria = async () => {
        if (
            !newMateria.nombre.trim() ||
            !newMateria.codigo.trim() ||
            !newMateria.docente.trim() ||
            !newMateria.semestre.trim()
        ) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }

        // Validar si el código es único
        const codigoEsUnico = await validarCodigoUnico(newMateria.codigo);
        if (!codigoEsUnico) {
            Alert.alert('Error', 'El código ya existe. Por favor, usa un código único.');
            return;
        }

        try {
            // Guardar la materia en Firestore
            const docRef = await addDoc(collection(db, 'materias'), newMateria);
            console.log('Materia agregada con ID: ', docRef.id);

            // Notificar al componente principal (GradesScreen)
            onAddSubject({ ...newMateria, id: docRef.id });

            // Reiniciar el estado
            setNewMateria({
                nombre: '',
                calificaciones: [],
                codigo: '',
                docente: '',
                semestre: '1er semestre',
                tareas: {
                    descripcion: '',
                    fecha_entrega: Timestamp.fromDate(new Date()),
                },
            });
        } catch (error) {
            console.error('Error al agregar la materia: ', error);
            Alert.alert('Error', 'No se pudo agregar la materia.');
        }
    };

    const handleCodigoChange = (text) => {
        // Permitir solo números
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
                keyboardType="numeric" // Muestra el teclado numérico
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
                {[
                    '1er semestre',
                    '2do semestre',
                    '3er semestre',
                    '4to semestre',
                    '5to semestre',
                    '6to semestre',
                    '7mo semestre',
                    '8vo semestre',
                    '9no semestre',
                    '10mo semestre',
                    '12vo semestre',
                    '13vo semestre',
                ].map((semestre) => (
                    <Picker.Item key={semestre} label={semestre} value={semestre} />
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
        backgroundColor: '#eaf4f4', // Color suave para el fondo
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a535c', // Color oscuro pero agradable para el texto
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#ffffff', // Fondo blanco limpio para inputs
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        borderColor: '#4ecdc4', // Borde del input con un color llamativo
        borderWidth: 2,
        width: '90%',
        fontSize: 16,
        color: '#333', // Texto en un gris oscuro
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
    buttonContainer: {
        marginTop: 20,
        width: '90%',
        borderRadius: 10,
        overflow: 'hidden',
    },
    button: {
        backgroundColor: '#1a535c',
        paddingVertical: 15,
        borderRadius: 10,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RegisterSubjectForm;
