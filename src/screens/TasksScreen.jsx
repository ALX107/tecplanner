import React, { useState, useEffect } from 'react';
import { View, Modal, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import app from '../utils/firebase';
import { collection, increment, getDocs, addDoc, getFirestore, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { Alert } from 'react-native'; // Agregar esta importación también
import { getAuth } from 'firebase/auth';

const TasksScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [materias, setMaterias] = useState([]); // Nuevo estado para materias

    // Función para obtener materias filtradas por el usuario autenticado
    const fetchMaterias = async () => {
        try {
            const db = getFirestore(app);
            const auth = getAuth(app);
            const userId = auth.currentUser?.uid; // Obtener el UID del usuario autenticado

            if (!userId) {
                console.error("Usuario no autenticado.");
                return;
            }

            // Filtrar materias por userId
            const q = query(
                collection(db, "materias"),
                where("userId", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const materiasData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                codigo: doc.data().codigo,
                nombre: doc.data().nombre || doc.data().codigo,
            }));

            setMaterias(materiasData); // Actualiza el estado con las materias del usuario
        } catch (error) {
            console.error("Error al obtener las materias:", error);
            Alert.alert(
                "Error",
                "Hubo un problema al obtener las materias. Por favor, inténtalo de nuevo.",
                [{ text: "OK" }]
            );
        }
    };


    // Obtener tareas desde Firestore
    const fetchTasks = async () => {
        try {
            const auth = getAuth(app);
            const userId = auth.currentUser?.uid;

            if (!userId) {
                console.error("Usuario no autenticado.");
                return;
            }

            const db = getFirestore(app);
            const q = query(
                collection(db, "tareas"),
                where("userId", "==", userId) // Filtrar tareas por userId
            );

            const querySnapshot = await getDocs(q);
            const pendingTasks = [];
            const completedTasksList = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const task = {
                    id: doc.id,
                    materia: data.materia,
                    descripcion: data.descripcion,
                    fechaEntrega: data.fechaEntrega.toDate(),
                    completed: data.status,
                };

                if (data.status) {
                    completedTasksList.push(task);
                } else {
                    pendingTasks.push(task);
                }
            });

            setTasks(pendingTasks);
            setCompletedTasks(completedTasksList);
        } catch (error) {
            console.error("Error al obtener las tareas:", error);
            Alert.alert(
                "Error",
                "Hubo un problema al obtener las tareas. Por favor, inténtalo de nuevo.",
                [{ text: "OK" }]
            );
        }
    };



    useEffect(() => {
        fetchMaterias();
        fetchTasks();
    }, []);

    // Manejo de tareas completadas
    const handleToggleTask = async (taskId) => {
        try {
            const db = getFirestore(app);

            // Actualizar el estado de la tarea en Firestore
            await updateDoc(doc(db, "tareas", taskId), {
                status: true,
            });

            // Incrementar el contador de tareas completadas en Firestore
            const userId = getAuth(app).currentUser.uid; // Obtén el UID del usuario autenticado
            await updateDoc(doc(db, "users", userId), {
                tasksCompleted: increment(1), // Incrementa en 1
            });

            // Actualizar la interfaz obteniendo las tareas actualizadas
            fetchTasks();
        } catch (error) {
            console.error("Error al completar la tarea:", error);
            Alert.alert(
                "Error",
                "Hubo un problema al completar la tarea. Por favor, inténtalo de nuevo.",
                [{ text: "OK" }]
            );
        }
    };

    //manejo de regresar de completadas a tareas pendientes
    const handleMoveToPending = async (taskId) => {
        try {
            const db = getFirestore(app);

            // Actualizar el estado de la tarea en Firestore
            await updateDoc(doc(db, "tareas", taskId), {
                status: false, // Cambiar el estad
            });

            // Incrementar el contador de tareas completadas en Firestore
            const userId = getAuth(app).currentUser.uid; // Obtén el UID del usuario autenticado
            await updateDoc(doc(db, "users", userId), {
                tasksCompleted: increment(-1), // Incrementa en 1
            });

            // Actualizar la interfaz obteniendo las tareas actualizadas
            fetchTasks();
        } catch (error) {
            console.error("Error al mover la tarea a tareas pendientes:", error);
            Alert.alert(
                "Error",
                "Hubo un problema al mover la tarea a pendientes. Por favor, inténtalo de nuevo.",
                [{ text: "OK" }]
            );
        }
    };

    // Agregar nueva tarea a Firestore
    const handleAddTask = async () => {
        const auth = getAuth(app);
        const userId = auth.currentUser?.uid; // Obtén el UID del usuario autenticado

        if (!userId) {
            Alert.alert("Error", "Usuario no autenticado.");
            return;
        }

        if (!selectedSubject || !taskTitle || !dueDate) {
            Alert.alert(
                "Campos incompletos",
                "Por favor, complete todos los campos.",
                [{ text: "OK" }]
            );
        }

        if (taskTitle && selectedSubject && dueDate) {
            try {
                const db = getFirestore(app);

                if (isEditMode && editingTask) {
                    // Actualizar tarea existente
                    await updateDoc(doc(db, "tareas", editingTask.id), {
                        userId, // Asegúrate de que userId esté en la tarea
                        materia: selectedSubject,
                        descripcion: taskTitle,
                        fechaEntrega: dueDate,
                        status: false,
                    });
                } else {
                    // Crear nueva tarea
                    await addDoc(collection(db, "tareas"), {
                        userId, // Incluye el userId
                        materia: selectedSubject,
                        descripcion: taskTitle,
                        fechaEntrega: dueDate,
                        status: false,
                    });
                }

                fetchTasks();
                setTaskTitle('');
                setSelectedSubject(null);
                setDueDate(null);
                setModalVisible(false);
                setIsEditMode(false);
                setEditingTask(null);
            } catch (error) {
                console.error("Error al gestionar la tarea:", error);
                Alert.alert(
                    "Error",
                    "Hubo un problema al agregar la tarea. Por favor, inténtalo de nuevo.",
                    [{ text: "OK" }]
                );
            }
        }
    };


    // Función para manejar la edición
    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskTitle(task.descripcion);
        setSelectedSubject(task.materia);
        setDueDate(task.fechaEntrega);
        setIsEditMode(true);
        setModalVisible(true);
    };

    //eliminar
    const handleDeleteTask = async (taskId) => {
        Alert.alert(
            "Eliminar Tarea",
            "¿Estás seguro de que deseas eliminar esta tarea?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const db = getFirestore(app);
                            await deleteDoc(doc(db, "tareas", taskId));
                            fetchTasks();
                        } catch (error) {
                            console.error("Error al eliminar la tarea:", error);
                            Alert.alert(
                                "Error",
                                "Hubo un problema al eliminar la tarea. Por favor, inténtalo de nuevo.",
                                [{ text: "OK" }]
                            );
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    //MUESTRA LISTA DE TAREAS PENDIENTES
    const renderTask = ({ item }) => (
        <View style={[styles.taskItem]}>
            <Pressable
                style={styles.checkbox}
                onPress={() => handleToggleTask(item.id)}
            >
                {item.completed ? (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                ) : (
                    <Ionicons name="ellipse-outline" size={24} color="white" />
                )}
            </Pressable>
            <View style={styles.taskContent}>
                <Text style={styles.taskSubject}>{item.materia}</Text>
                <Text style={styles.taskText}>{item.descripcion}</Text>
                <Text style={styles.taskDate}>
                    Fecha de entrega: {item.fechaEntrega.toLocaleDateString('es-ES')}
                </Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditTask(item)}
                >
                    <Ionicons name="pencil" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTask(item.id)}
                >
                    <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Modificar el título del modal según el modo
    const modalTitle = isEditMode ? "Editar Tarea" : "Nueva Tarea";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestión de Tareas</Text>

            {/* Tareas Pendientes */}
            <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.taskList}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay tareas pendientes</Text>}
            />

            {/* Tareas Completadas */}
            <Text style={styles.sectionTitle}>Tareas Completadas</Text>
            <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.taskItem, styles.taskItemCompleted]}>
                        <Ionicons name="checkmark-circle" size={24} color="white" style={styles.checkbox} />
                        <View style={styles.taskContent}>
                            <Text style={[styles.taskText, styles.taskTextCompleted]}>{item.descripcion}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.revertButton}
                            onPress={() => handleMoveToPending(item.id)}
                        >
                            <Ionicons name="arrow-undo" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.taskList}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay tareas completadas</Text>}
            />

            {/* Modal para agregar tareas */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>

                        <Picker
                            selectedValue={selectedSubject}
                            onValueChange={(itemValue) => setSelectedSubject(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Selecciona una materia" value={null} />
                            {materias.map((materia) => (
                                <Picker.Item
                                    key={materia.id}
                                    label={`${materia.codigo} - ${materia.nombre}`}
                                    value={materia.codigo}
                                />
                            ))}
                        </Picker>

                        <TextInput
                            style={styles.input}
                            placeholder="Descripción de la tarea"
                            value={taskTitle}
                            onChangeText={setTaskTitle}
                        />

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setDatePickerVisible(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {dueDate ? dueDate.toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Selecciona la fecha de entrega'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setIsEditMode(false);
                                    setEditingTask(null);
                                }}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.addButton]}
                                onPress={handleAddTask}
                            >
                                <Text style={styles.buttonText}>
                                    {isEditMode ? 'Guardar' : 'Agregar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                    setDueDate(date);
                    setDatePickerVisible(false);
                }}
                onCancel={() => setDatePickerVisible(false)}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#555',
        marginVertical: 10,
        marginLeft: 20,
    },
    taskList: {
        padding: 20,
    },
    taskItem: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    taskItemCompleted: {
        backgroundColor: '#32cd32',
    },
    taskText: {
        fontSize: 18,
        color: '#fff',
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
    },
    checkbox: {
        marginRight: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ff4500',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginVertical: 10,
        fontSize: 16,
    },
    dateButton: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
    },
    dateButtonText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ff4500',
    },
    addButton: {
        backgroundColor: '#3498db',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    taskContent: {
        flex: 1,
        marginRight: 10,
    },
    taskSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    taskDate: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 5,
        marginLeft: 10,
    },
    deleteButton: {
        padding: 5,
        marginLeft: 10,
    },
    revertButton: {
        padding: 5,
        marginLeft: 10,
        backgroundColor: '#3498db',
        borderRadius: 8,
    },
});

export default TasksScreen;