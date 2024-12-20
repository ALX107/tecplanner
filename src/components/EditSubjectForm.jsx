import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert,} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { updateDoc, doc, getDocs, collection, query, where } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '../utils/firebase';
import { getAuth } from 'firebase/auth';

const EditSubjectForm = ({ visible, onClose, materia, onUpdate }) => {
    const [editedData, setEditedData] = useState({
        codigo: '',
        nombre: '',
        docente: '',
        semestre: '1er semestre',
    });
    const db = getFirestore(app);

    useEffect(() => {
        if (materia) {
            setEditedData({
                codigo: materia.codigo || '',
                nombre: materia.nombre || '',
                docente: materia.docente || '',
                semestre: materia.semestre || '1er semestre',
            });
        }
    }, [materia]);

    const validarCodigoUnico = async (codigo) => {
        try {
            const auth = getAuth(app);
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.error('Usuario no autenticado');
                return false;
            }

            const q = query(
                collection(db, 'materias'),
                where('userId', '==', userId),
                where('codigo', '==', codigo)
            );

            const querySnapshot = await getDocs(q);

            // Si no hay documentos con el mismo código o el único documento es el que estamos editando, es válido
            if (
                querySnapshot.empty ||
                (querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === materia.id)
            ) {
                return true;
            }

            return false; // El código ya existe en otra materia
        } catch (error) {
            console.error('Error al validar el código único:', error);
            return false;
        }
    };
    

    const editarMateria = async () => {
        if (
            !editedData.codigo.trim() ||
            !editedData.nombre.trim() ||
            !editedData.docente.trim() ||
            !editedData.semestre.trim()
        ) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }

        const codigoEsUnico = await validarCodigoUnico(editedData.codigo);
        if (!codigoEsUnico) {
            Alert.alert('Error', 'El código ya existe. Por favor, usa un código único.');
            return;
        }
    
        try {
            const updatedMateria = { ...editedData, userId: materia.userId }; // Mantén el userId
            await updateDoc(doc(db, 'materias', materia.id), updatedMateria);
            onUpdate({ ...materia, ...updatedMateria });
            onClose();
        } catch (error) {
            console.error('Error al editar la materia: ', error);
            Alert.alert('Error', 'No se pudo editar la materia.');
        }
    };
    

    const handleCodigoChange = (text) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setEditedData({ ...editedData, codigo: numericValue });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Editar Materia</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Código"
                        value={editedData.codigo}
                        keyboardType="numeric"
                        onChangeText={handleCodigoChange}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={editedData.nombre}
                        onChangeText={(text) => setEditedData({ ...editedData, nombre: text })}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Docente"
                        value={editedData.docente}
                        onChangeText={(text) => setEditedData({ ...editedData, docente: text })}
                    />

                    <Text style={styles.pickerLabel}>Selecciona el Semestre</Text>
                    <Picker
                        selectedValue={editedData?.semestre || ''} // Asegúrate de manejar un valor por defecto si editedData no tiene semestre
                        onValueChange={(itemValue) =>
                            setEditedData({ ...editedData, semestre: itemValue }) // Actualiza la propiedad semestre
                        }
                        style={styles.picker}
                    >
                        {[...Array(13)].map((_, index) => (
                            <Picker.Item
                                key={index + 1} // Clave única para cada elemento
                                label={`${index + 1}º semestre`} // Texto visible para cada opción
                                value={`${index + 1}º semestre`} // Valor asociado
                            />
                        ))}
                    </Picker>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.saveButton} onPress={editarMateria}>
                            <Text style={styles.buttonText}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#34495e',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        marginVertical: 10,
        borderRadius: 10,
        borderColor: '#bdc3c7',
        borderWidth: 1.5,
        fontSize: 16,
        color: '#2c3e50',
    },
    picker: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderColor: '#bdc3c7',
        borderWidth: 1.5,
        marginVertical: 10,
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#2ecc71',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EditSubjectForm;
