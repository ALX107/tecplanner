import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import ActionBar from '../components/ActionBar'
import AddBirthday from '../components/AddBirthday'

export default function ListBirthday() {
    const [showList, setshowList] = useState(true)

    return (
        <View style={styles.container}>
            {
                showList ? (
                    <>
                        <Text>ListBirthday</Text>
                        <Text>ListBirthday</Text>
                        <Text>ListBirthday</Text>
                    </>
                ) : (
                    <AddBirthday />
                )
            }
            <ActionBar showList={showList} setshowList={setshowList} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        allignItems: 'center',
        height: '100%',
    }
})