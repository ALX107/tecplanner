import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

import Auth from '../components/Auth';

const Stack = createStackNavigator();

const AppNavigator = () => {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen

                    name="Auth"

                    component={Auth}

                    options={{ headerShown: false }}

                />
            </Stack.Navigator>
        </NavigationContainer>

    );

};

export default AppNavigator;