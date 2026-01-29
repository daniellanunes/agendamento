import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';

import HomeScreen from '../../screens/Home';
import AppointmentFormScreen from '../../screens/AppointmentForm';
import AppointmentDetailsScreen from '../../screens/AppointmentDetails';
import ClientsScreen from '../../screens/Clients';
import ServicesScreen from '../../screens/Services';

export type RootStackParamList = {
  Home: undefined;
  AppointmentForm: { dateISO?: string; time?: string } | undefined;
  AppointmentDetails: { id: string };
  Clients: undefined;
  Services: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Agenda' }} />
        <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Novo agendamento' }} />
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Detalhes' }} />
        <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Clientes' }} />
        <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Serviços' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
