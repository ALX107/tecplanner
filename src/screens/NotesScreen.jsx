import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import app from "../utils/firebase"; // Importa tu archivo firebase.js
import NoteForm from '../components/NoteForm'; // Importa el nuevo componente

const db = getFirestore(app); // Instancia de Firestore

const NotesScreen = () => {
    const [notas, setNotas] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal

    // Cargar las notas desde Firebase
    useEffect(() => {
        const fetchNotas = async () => {
            const snapshot = await getDocs(collection(db, "notas"));
            const notesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotas(notesData);
        };

        fetchNotas();
    }, []);

    // Guardar nueva nota o actualizar
    const handleSaveNote = async (titulo, contenido) => {
        try {
            if (isEditing && selectedNote) {
                const noteRef = doc(db, "notas", selectedNote.id);
                await updateDoc(noteRef, { titulo, contenido });
                setNotas((prevNotas) =>
                    prevNotas.map((nota) =>
                        nota.id === selectedNote.id ? { ...nota, titulo, contenido } : nota
                    )
                );
            } else {
                const nuevaNota = {
                    titulo,
                    contenido,
                    fechaCreacion: new Date().toISOString(),
                };
                const docRef = await addDoc(collection(db, "notas"), nuevaNota);
                setNotas((prevNotas) => [...prevNotas, { id: docRef.id, ...nuevaNota }]);
            }

            // Limpiar y cerrar
            setModalVisible(false);
            setSelectedNote(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar la nota:", error);
        }
    };

    // Editar una nota
    const handleEditNote = (note) => {
        setSelectedNote(note);
        setIsEditing(true);
        setModalVisible(true);
    };

    // Borrar una nota
    const handleDeleteNote = async (id) => {
        const noteRef = doc(db, "notas", id);
        await deleteDoc(noteRef);
        setNotas((prevNotas) => prevNotas.filter((nota) => nota.id !== id));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notas Rápidas</Text>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    setSelectedNote(null);
                    setIsEditing(false);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.addButtonText}>Nueva Nota</Text>
            </TouchableOpacity>

            {/* Modal para agregar/editar notas */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <NoteForm
                        isEditing={isEditing}
                        tituloInicial={selectedNote?.titulo}
                        contenidoInicial={selectedNote?.contenido}
                        onSave={handleSaveNote}
                        onCancel={() => setModalVisible(false)}
                    />
                </View>
            </Modal>

            <FlatList
                data={notas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.noteItem}>
                        <Text style={styles.noteTitle}>{item.titulo}</Text>
                        <Text style={styles.noteContent}>{item.contenido}</Text>
                        <Text style={styles.noteDate}>
                            Creado el: {new Date(item.fechaCreacion).toLocaleDateString()}
                        </Text>
                        <View style={styles.noteActions}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => handleEditNote(item)}
                            >
                                <Text style={styles.editButtonText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteNote(item.id)}
                            >
                                <Text style={styles.deleteButtonText}>Borrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    noteItem: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    noteContent: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'justify',
    },
    noteDate: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4,
        textAlign: 'right',
        marginBottom : 10,
        fontStyle: 'bold',
    },
    noteActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: '#3498db',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default NotesScreen;
