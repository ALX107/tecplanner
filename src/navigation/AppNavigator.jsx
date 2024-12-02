import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

import Auth from '../components/Auth';
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TasksScreen from "../screens/TasksScreen";
import GradesScreen from "../screens/GradesScreen";
import NotesScreen from "../screens/NotesScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Tasks" component={TasksScreen} />
                <Stack.Screen name="Grades" component={GradesScreen} />
                <Stack.Screen name="Notes" component={NotesScreen} />
            </Stack.Navigator>
        </NavigationContainer>

    );

};

export default AppNavigator;