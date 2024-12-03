import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterSubjectForm from '../components/RegisterSubjectForm';
import EditSubjectForm from '../components/EditSubjectForm';
import ViewGradesScreen from './ViewGradesScreen';
import { updateDoc, increment, getFirestore, collection, getDocs, doc, query, where, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import app from '../utils/firebase';
import { getAuth } from 'firebase/auth';

const Stack = createStackNavigator();

const MainScreen = ({ navigation }) => {
    const [materias, setMaterias] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const db = getFirestore(app);

    // Cargar materias desde Firestore
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const auth = getAuth(app);
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    console.error('Usuario no autenticado');
                    return;
                }
    
                const q = query(
                    collection(db, 'materias'),
                    where('userId', '==', userId)
                );
    
                const querySnapshot = await getDocs(q);
                const materiasData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
    
                setMaterias(materiasData);
            } catch (error) {
                console.error('Error al obtener las materias: ', error);
            }
        };
    
        fetchMaterias();
    }, []); // Asegúrate de que el array de dependencias esté vacío
    

    // Agregar una nueva materia
    const agregarMateria = (materia) => {
        setMaterias([...materias, materia]);
        setShowForm(false);
    };

const eliminarMateria = async (id) => {
    try {
        console.log('Intentando eliminar documento con ID:', id); // Depuración
        const docRef = doc(db, 'materias', id);

        // Verificar si el documento existe antes de eliminarlo
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.error('El documento con el ID proporcionado no existe:', id);
            return;
        }

        // Eliminar el documento
        await deleteDoc(docRef);
        console.log(`Documento con ID ${id} eliminado correctamente`);

        // Actualizar el estado local
        setMaterias((prevMaterias) =>
            prevMaterias.filter((materia) => materia.id !== id)
        );
    } catch (error) {
        console.error('Error al eliminar la materia: ', error.message);
    }
};

    // Actualizar la lista local después de editar
    const actualizarMateria = (updatedMateria) => {
        setMaterias((prevMaterias) =>
            prevMaterias.map((materia) =>
                materia.id === updatedMateria.id ? updatedMateria : materia
            )
        );
    };

    const actualizarPromedioGeneral = async (userId) => {
        try {
            const db = getFirestore(app);
    
            // Obtener todas las materias del usuario
            const materiasSnapshot = await getDocs(
                query(collection(db, 'materias'), where('userId', '==', userId))
            );
    
            let totalSum = 0;
            let totalSubjects = 0;
    
            materiasSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.calificaciones && data.calificaciones.length > 0) {
                    const promedioMateria =
                        data.calificaciones.reduce((a, b) => a + b, 0) /
                        data.calificaciones.length;
                    totalSum += promedioMateria;
                    totalSubjects += 1;
                }
            });
    
            // Calcular el promedio general
            const averageGrade = totalSubjects > 0 ? totalSum / totalSubjects : 0;
    
            // Actualizar en Firestore el campo averageGrade del usuario
            await updateDoc(doc(db, 'users', userId), {
                averageGrade,
            });
            console.log('Promedio General actualizado:', averageGrade);
        } catch (error) {
            console.error('Error al actualizar el promedio general:', error);
        }
    };
    
    // Llama a esta función cada vez que actualices calificaciones
    // Por ejemplo, después de guardar nuevas calificaciones:
    const guardarCalificaciones = async (materiaId, calificaciones) => {
        try {
            const db = getFirestore(app);
    
            // Actualizar la materia con las nuevas calificaciones
            await updateDoc(doc(db, 'materias', materiaId), { calificaciones });
    
            // Actualizar promedio general del usuario
            const userId = getAuth(app).currentUser.uid; // Obtén el UID del usuario autenticado
            await actualizarPromedioGeneral(userId);
        } catch (error) {
            console.error('Error al guardar calificaciones:', error);
        }
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowForm(!showForm)}
            >
                <Text style={styles.addButtonText}>
                    {showForm ? 'CERRAR FORMULARIO' : 'AGREGAR MATERIAS'}
                </Text>
            </TouchableOpacity>

            {showForm ? (
                <RegisterSubjectForm onAddSubject={agregarMateria} />
            ) : (
                <>
                    <Text style={styles.title}>Materias Registradas</Text>

                    <FlatList
                        data={materias}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <Text style={styles.itemTitle}>{item.nombre}</Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('ViewGradesScreen', { materia: item })
                                    }
                                >
                                    <View>
                                        <Text style={styles.itemText}>Código: {item.codigo}</Text>
                                        <Text style={styles.itemText}>Docente: {item.docente}</Text>
                                        <Text style={styles.itemText}>Semestre: {item.semestre}</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Botones */}
                                <View style={styles.buttons}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            setSelectedMateria(item);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>EDITAR</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => eliminarMateria(item.id)}
                                    >
                                        <Text style={styles.buttonText}>ELIMINAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </>
            )}
            <EditSubjectForm
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                materia={selectedMateria}
                onUpdate={actualizarMateria}
            />
        </View>
    );
};

const GradesScreen = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // Oculta el encabezado del navegador
            }}
        >
            <Stack.Screen
                name="MainScreen"
                component={MainScreen}
            />
            <Stack.Screen
                name="ViewGradesScreen"
                component={ViewGradesScreen}
            />
        </Stack.Navigator>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f8ff', // Fondo claro y suave
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#34495e', // Texto oscuro moderno
        marginBottom: 15,
        textAlign: 'center',
    },
    item: {
        backgroundColor: '#ecf0f1', // Fondo sutil para cada elemento
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000', // Sombra para dar profundidad
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3, // Sombra para Android
    },
    itemTitle: {
        fontSize: 18, // Tamaño más grande
        fontWeight: 'bold', // Negritas
        color: '#34495e', // Texto oscuro
        textAlign: 'center', // Centrado
        marginBottom: 10, // Separación debajo del título
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    editButton: {
        backgroundColor: '#3498db', // Azul moderno
        padding: 10,
        borderRadius: 10,
        width: '48%',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#e74c3c', // Rojo vibrante
        padding: 10,
        borderRadius: 10,
        width: '48%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#3498db', // Azul moderno
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        borderColor: '#bdc3c7', // Gris claro para bordes
        borderWidth: 1.5,
        fontSize: 16,
        color: '#34495e',
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        marginVertical: 10,
        borderRadius: 10,
        borderColor: '#bdc3c7',
        borderWidth: 1.5,
    },
    pickerLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 5,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
});


export default GradesScreen;
