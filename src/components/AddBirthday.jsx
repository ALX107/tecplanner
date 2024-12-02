import { StyleSheet, TextInput, View, Text } from 'react-native'
import React from 'react'
import { useState } from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';

export default function AddBirthday() {

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [formData, setFormData] = useState({});

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const dateBirth = date
        dateBirth.setHours(0)
        dateBirth.setMinutes(0)
        dateBirth.setSeconds(0)

        setFormData({ ...formData, dateBirth })

        console.log(formData);
        console.log(date);
        console.log(moment(date).format('LL'));
        hideDatePicker();
    };

    const onChange = (e, type) => {
        setFormData({ ...formData, [type]: e.nativeEvent.text })
    }

    return (
        <>
            <View>
                <TextInput
                    placeholder='Nombre'
                    placeholderTextColor='#969696'
                    onChange={e => onChange(e, 'name')}
                />
            </View>
            <View>
                <TextInput
                    placeholder='Apellidos'
                    placeholderTextColor='#969696'
                    onChange={e => onChange(e, 'lastname')}
                />
            </View>
            <View>
                <TextInput placeholder='Fecha de nacimiento' placeholderTextColor='#969696' onPress={showDatePicker} />
            </View>
            <View>
                <Text
                    style={{
                        color: formData.dateBirth ? 'green' : 'blue',
                        fontSize: 24,
                    }}
                    onPress={showDatePicker} >
                    {
                        formData.dateBirth
                            ? moment(formData.dateBirth).format('LL')
                            : 'Fecha de nacimiento'
                    }
                </Text>
            </View>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
        </>
    )
}

const styles = StyleSheet.create({})