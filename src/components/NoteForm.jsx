import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const NoteForm = ({ isEditing, tituloInicial, contenidoInicial, onSave, onCancel }) => {
    const [titulo, setTitulo] = useState(tituloInicial || '');
    const [contenido, setContenido] = useState(contenidoInicial || '');

    useEffect(() => {
        setTitulo(tituloInicial || '');
        setContenido(contenidoInicial || '');
    }, [tituloInicial, contenidoInicial]);

    const handleSave = () => {
        if (!titulo.trim() || !contenido.trim()) {
            alert("Por favor, completa todos los campos antes de guardar.");
            return;
        }
        onSave(titulo, contenido);
    };

    return (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
                {isEditing ? "Editar Nota" : "Nueva Nota"}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Título de la nota"
                value={titulo}
                onChangeText={setTitulo}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Contenido de la nota"
                value={contenido}
                onChangeText={setContenido}
                multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                    {isEditing ? "Actualizar Nota" : "Guardar Nota"}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default NoteForm;
