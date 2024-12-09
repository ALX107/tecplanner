import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, } from 'react-native';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import app from '../utils/firebase';

const ViewGradesScreen = ({ route, navigation }) => {
    const { materia } = route.params;
    const [calificaciones, setCalificaciones] = useState([]);
    const [viewMode, setViewMode] = useState('');
    const [promedioMateria, setPromedioMateria] = useState(0);
    const db = getFirestore(app);

    useEffect(() => {
        verificarCalificacionesExistentes();
    }, []);

    const verificarCalificacionesExistentes = async () => {
        try {
            const materiaRef = doc(db, 'materias', materia.id);
            const docSnap = await getDoc(materiaRef);

            if (docSnap.exists()) {
                const calificacionesExistentes = docSnap.data().calificaciones || [];
                setCalificaciones(calificacionesExistentes);
                setPromedioMateria(calcularPromedioMateria(calificacionesExistentes));
                setViewMode(calificacionesExistentes.length > 0 ? 'view' : 'register');
            }
        } catch (error) {
            console.error('Error al verificar las calificaciones:', error);
        }
    };

    const registrarCalificaciones = async () => {
        try {
            const materiaRef = doc(db, 'materias', materia.id);
            await updateDoc(materiaRef, { calificaciones });
            Alert.alert('Éxito', 'Calificaciones registradas correctamente.');
            setViewMode('view');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron registrar las calificaciones.');
            console.error(error);
        }
    };

    const agregarUnidad = () => {
        if (calificaciones.length >= 6) {
            Alert.alert('Error', 'No puedes agregar más de 6 unidades.');
            return;
        }
        setCalificaciones((prevCalificaciones) => [...prevCalificaciones, ""]);
    };

    const verificarEstado = () => {
        if (calificaciones.includes(0) || calificaciones.includes("")) {
            Alert.alert(
                'Estado',
                'El estudiante está en riesgo de recursar. Esfuérzate más para mejorar tus calificaciones.'
            );
        } else {
            Alert.alert('Estado', 'El estudiante está en buen estado académico.');
        }
    };

    const actualizarCalificacionTemporal = (index, value) => {
        const nuevaCalificaciones = [...calificaciones];
        nuevaCalificaciones[index] = value;
        setCalificaciones(nuevaCalificaciones);
    };

    const confirmarCalificacion = (index) => {
        const nuevaCalificaciones = [...calificaciones];
        let calificacionNumerica = parseInt(nuevaCalificaciones[index], 10);

        if (!isNaN(calificacionNumerica)) {
            if (calificacionNumerica > 100) {
                Alert.alert('Error', 'No se permiten calificaciones mayores a 100.');
                calificacionNumerica = 100;
            } else if (calificacionNumerica < 70 && calificacionNumerica > 0) {
                calificacionNumerica = 0;
                Alert.alert('ATENCIÓN!!!', 'Recuerda que menos de 70 es 0');
            }
        } else {
            calificacionNumerica = "";
        }

        nuevaCalificaciones[index] = calificacionNumerica;
        setCalificaciones(nuevaCalificaciones);
    };

    const calcularPromedioMateria = (calificaciones) => {
        if (!calificaciones || calificaciones.length === 0) return 0;
        const suma = calificaciones.reduce((a, b) => a + b, 0);
        return suma / calificaciones.length;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Gestión de Calificaciones</Text>
                <Text style={styles.subtitle}>{materia.nombre}</Text>

                <View style={styles.buttonGroup}>
                    {viewMode !== 'register' && ( // Mostrar botones solo si no estás en modo "register"
                        <>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => setViewMode('register')}
                            >
                                <Text style={styles.buttonText}>Registrar Calificaciones</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={verificarEstado}>
                                <Text style={styles.buttonText}>Verificar Estado</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {viewMode === 'register' && (
                    <>
                        <Text style={styles.subtitle}>Registrar Calificaciones</Text>
                        {calificaciones.map((item, index) => (
                            <View style={styles.gradeRow} key={index}>
                                <Text style={styles.gradeText}>Unidad {index + 1}:</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    placeholder="70-100"
                                    value={item.toString()}
                                    onChangeText={(text) =>
                                        actualizarCalificacionTemporal(index, text)
                                    }
                                    onBlur={() => confirmarCalificacion(index)}
                                    onSubmitEditing={() => confirmarCalificacion(index)}
                                />
                            </View>
                        ))}

                        {calificaciones.length < 6 && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#FFB74D' }]}
                                onPress={agregarUnidad}
                            >
                                <Text style={styles.buttonText}>Agregar Unidad</Text>
                            </TouchableOpacity>
                        )}

                        {calificaciones.some((item) => item !== "") && (
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={registrarCalificaciones}
                            >
                                <Text style={styles.buttonText}>Guardar Calificaciones</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {viewMode === 'view' && (
                    <>
                        <Text style={styles.subtitle}>Calificaciones Registradas</Text>
                        {calificaciones.map((item, index) => (
                            <View style={styles.gradeRow} key={index}>
                                <Text style={styles.gradeText}>
                                    Unidad {index + 1}: {item}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.promedioContainer}>
                            <Text style={styles.promedioTitle}>Promedio de la Materia</Text>
                            <Text style={[
                                styles.promedioValue,
                                { color: promedioMateria >= 8 ? '#2ecc71' : promedioMateria >= 6 ? '#f1c40f' : '#e74c3c' }
                            ]}>
                                {promedioMateria.toFixed(2)}
                            </Text>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.button, styles.backButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2c3e50',
        marginVertical: 10,
        textAlign: 'center',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    gradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        padding: 15,
        backgroundColor: '#ecf0f1',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    gradeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#34495e',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#bdc3c7',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        width: 80,
        textAlign: 'center',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#66BB6A',
        paddingVertical: 12,
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    backButton: {
        marginTop: 20,
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    promedioContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
        elevation: 3,
    },
    promedioTitle: {
        fontSize: 18,
        color: '#34495e',
        marginBottom: 5,
    },
    promedioValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
});

export default ViewGradesScreen;
