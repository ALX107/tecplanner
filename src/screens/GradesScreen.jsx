import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterSubjectForm from '../components/RegisterSubjectForm';
import EditSubjectForm from '../components/EditSubjectForm';
import ViewGradesScreen from './ViewGradesScreen';
import { updateDoc, setDoc, getFirestore, collection, getDocs, doc, query, where, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import app from '../utils/firebase';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const Stack = createStackNavigator();

const MainScreen = ({ navigation }) => {
    const [materias, setMaterias] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const db = getFirestore(app);
    const [promediosPorSemestre, setPromediosPorSemestre] = useState({});
    const [promedioGeneral, setPromedioGeneral] = useState(0);

    // Cargar materias desde Firestore
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const auth = getAuth(app);
                const userId = auth.currentUser?.uid;

                if (!userId) {
                    console.error("Usuario no autenticado.");
                    return;
                }

                const db = getFirestore(app);

                // Filtrar materias por userId
                const q = query(
                    collection(db, "materias"),
                    where("userId", "==", userId)
                );

                const querySnapshot = await getDocs(q);
                const materiasData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setMaterias(materiasData);
                calcularPromedios(materiasData);
            } catch (error) {
                console.error("Error al obtener las materias:", error);
            }
        };

        fetchMaterias();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const fetchMaterias = async () => {
                try {
                    const auth = getAuth(app);
                    const userId = auth.currentUser?.uid;

                    if (!userId) {
                        console.error("Usuario no autenticado.");
                        return;
                    }

                    const db = getFirestore(app);

                    // Filtrar materias por userId
                    const q = query(
                        collection(db, "materias"),
                        where("userId", "==", userId)
                    );

                    const querySnapshot = await getDocs(q);
                    const materiasData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    setMaterias(materiasData);
                    calcularPromedios(materiasData);
                } catch (error) {
                    console.error("Error al obtener las materias:", error);
                }
            };

            fetchMaterias();
        }, [])
    );

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
            const materiasActualizadas = materias.filter((materia) => materia.id !== id);
            setMaterias(materiasActualizadas);

            // Recalcular promedios después de la eliminación
            calcularPromedios(materiasActualizadas);
        } catch (error) {
            console.error('Error al eliminar la materia: ', error.message);
        }
    };

    // Actualizar la lista local después de editar
    const actualizarMateria = async (updatedMateria) => {
        try {
            const userId = getAuth(app).currentUser?.uid;
            if (!userId) {
                console.error('Usuario no autenticado.');
                return;
            }

            // Actualizar la materia en Firestore
            const db = getFirestore(app);
            const docRef = doc(db, 'materias', updatedMateria.id);
            await updateDoc(docRef, {
                nombre: updatedMateria.nombre,
                calificaciones: updatedMateria.calificaciones,
                codigo: updatedMateria.codigo,
                docente: updatedMateria.docente,
                semestre: updatedMateria.semestre,
            });

            // Actualizar el estado local y recalcular promedios
            const materiasActualizadas = materias.map((materia) =>
                materia.id === updatedMateria.id ? updatedMateria : materia
            );
            setMaterias(materiasActualizadas);
            calcularPromedios(materiasActualizadas);
        } catch (error) {
            console.error('Error al actualizar la materia:', error);
        }
    };

    // Función para calcular promedios
    const calcularPromedios = async (materiasData) => {
        const promediosSemestre = {};
        let sumaTotalSemestres = 0;
        let totalSemestres = 0;

        // Iterar por las materias para agrupar por semestre
        materiasData.forEach((materia) => {
            // Usar el promedio de la materia directamente desde la base de datos
            const promedioMateria = materia.promedio;

            // Ignorar materias sin promedio o con promedio igual a 0
            if (promedioMateria === undefined || promedioMateria === 0) return;

            // Agrupar por semestre
            if (!promediosSemestre[materia.semestre]) {
                promediosSemestre[materia.semestre] = {
                    suma: 0,
                    cantidad: 0,
                };
            }

            promediosSemestre[materia.semestre].suma += promedioMateria;
            promediosSemestre[materia.semestre].cantidad += 1;
        });

        // Calcular promedio final por semestre
        const promediosFinales = {};
        Object.keys(promediosSemestre).forEach((semestre) => {
            const promedioSemestre = promediosSemestre[semestre].suma /
                promediosSemestre[semestre].cantidad;
            promediosFinales[semestre] = promedioSemestre;

            // Acumular para el cálculo del promedio general
            sumaTotalSemestres += promedioSemestre;
            totalSemestres += 1;
        });

        // Calcular promedio general basado en los promedios por semestre
        const promedioGeneralCalculado = totalSemestres > 0
            ? sumaTotalSemestres / totalSemestres
            : 0;

        setPromediosPorSemestre(promediosFinales);
        setPromedioGeneral(promedioGeneralCalculado);

        // Guardar promedio general en Firestore
        try {
            const auth = getAuth(app);
            const userId = auth.currentUser?.uid;

            if (!userId) {
                console.error('Usuario no autenticado.');
                return;
            }

            // Actualizar el campo averageGrade en la colección users
            const userDocRef = doc(db, 'users', userId);
            await setDoc(userDocRef, { averageGrade: promedioGeneralCalculado }, { merge: true });
            console.log('Promedio general guardado correctamente en Firestore.');
        } catch (error) {
            console.error('Error al guardar el promedio general en Firestore:', error);
        }
    };

    return (
        <View style={styles.container}>

            {/** Mostrar formulario si showForm es true */}
            {showForm ? (
                <RegisterSubjectForm
                    onAddSubject={agregarMateria}
                    onGoBack={() => setShowForm(false)} // Cierra el formulario y regresa a la lista
                />
            ) : (
                <>
                    {/** Mostrar Promedio General y Promedios por Semestre */}
                    <View style={styles.promedioGeneralContainer}>
                        <Text style={styles.promedioGeneralTitle}>Promedio General</Text>
                        <Text style={styles.promedioGeneralValue}>{promedioGeneral.toFixed(2)}</Text>
                    </View>

                    <View style={styles.promediosSemestreContainer}>
                        <Text style={styles.promediosSemestreTitle}>Promedios por Semestre</Text>
                        {Object.entries(promediosPorSemestre).map(([semestre, promedio]) => (
                            <View key={semestre} style={styles.semestreRow}>
                                <Text style={styles.semestreText}>{semestre}:</Text>
                                <Text style={styles.semestrePromedio}>{promedio.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    {/** Botón para alternar formulario */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowForm(!showForm)}
                    >
                        <Text style={styles.addButtonText}>
                            {showForm ? 'CERRAR FORMULARIO' : 'AGREGAR MATERIAS'}
                        </Text>
                    </TouchableOpacity>

                    {/** Lista de materias */}
                    <Text style={styles.title}>Materias Registradas</Text>
                    <FlatList
                        data={materias}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <Text style={styles.itemTitle}>{item.nombre}</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('ViewGradesScreen', { materia: item })}
                                >
                                    <View>
                                        <Text style={styles.itemText}>Código: {item.codigo}</Text>
                                        <Text style={styles.itemText}>Docente: {item.docente}</Text>
                                        <Text style={styles.itemText}>Semestre: {item.semestre}</Text>
                                    </View>
                                </TouchableOpacity>

                                {/** Botones para editar y eliminar */}
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

            {/** Formulario de edición de materia */}
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
    promedioGeneralContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3,
    },
    promedioGeneralTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#34495e',
        textAlign: 'center',
    },
    promedioGeneralValue: {
        fontSize: 24,
        color: '#2ecc71',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    promediosSemestreContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3,
    },
    promediosSemestreTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 10,
    },
    semestreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    semestreText: {
        fontSize: 16,
        color: '#34495e',
    },
    semestrePromedio: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: 'bold',
    },
});


export default GradesScreen;
