import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { getAuth, signOut } from "firebase/auth"
import app from '../utils/firebase'

export default function ActionBar({ showList, setshowList }) {

    function logout() {
        const auth = getAuth(app);
        signOut(auth).then(() => {
            console.log('Cerró Sesion');
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    }

    return (
        <View style={styles.viewFooter}>
            <View style={styles.viewClose}>
                <Text style={styles.txt} onPress={logout}>Cerrar Sesión</Text>
            </View>
            <View style={styles.viewDate}>
                <Text style={styles.txt} onPress={() => setshowList(!showList)}>
                    {
                        showList ? 'Nueva Fecha' : 'Cancelar fecha'
                    }
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    viewFooter: {
        position: 'absolute',
        bottom: 0, //posicion de abajo
        flexDirection: 'row',
        width: '100%',
        height: 50,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 30
    },
    viewClose: {
        backgroundColor: '#820000',
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 30
    },
    txt: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center'
    },
    viewDate: {
        backgroundColor: '#1EA1F1',
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 30
    }
})