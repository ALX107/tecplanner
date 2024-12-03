import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TasksScreen from "../screens/TasksScreen";
import GradesScreen from "../screens/GradesScreen";
import NotesScreen from "../screens/NotesScreen";
import AuthScreen from "../components/Auth";

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="TecPlanner" component={DashboardScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }}/>
                <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tareas' }}/>
                <Stack.Screen name="Grades" component={GradesScreen} options={{ title: 'Calificaciones' }}/>
                <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notas' }}/>
                <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Auth' }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
