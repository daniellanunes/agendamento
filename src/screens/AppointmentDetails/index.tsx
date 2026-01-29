import React, { useMemo } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation';
import { useAppStore } from '../../app/store/useAppStore';
import { AppointmentStatus } from '../../app/types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentDetails'>;

export default function AppointmentDetailsScreen({ navigation, route }: Props) {
  const id = route.params.id;

  const appt = useAppStore((s) => s.appointments.find((a) => a.id === id));
  const clients = useAppStore((s) => s.clients);
  const services = useAppStore((s) => s.services);

  const updateStatus = useAppStore((s) => s.updateAppointmentStatus);
  const remove = useAppStore((s) => s.removeAppointment);

  const clientName = useMemo(
    () => clients.find((c) => c.id === appt?.clientId)?.name ?? 'Cliente',
    [clients, appt?.clientId]
  );
  const service = useMemo(
    () => services.find((s) => s.id === appt?.serviceId),
    [services, appt?.serviceId]
  );

  if (!appt) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Text>Agendamento não encontrado.</Text>
      </View>
    );
  }

  const StatusBtn = ({ label, value }: { label: string; value: AppointmentStatus }) => {
    const active = appt.status === value;
    return (
      <Pressable
        onPress={() => updateStatus(appt.id, value)}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: active ? '#111' : '#eee',
        }}
      >
        <Text style={{ color: active ? '#fff' : '#111', fontWeight: '800' }}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ padding: 14, borderRadius: 12, backgroundColor: '#f4f4f4', gap: 6 }}>
        <Text style={{ fontSize: 18, fontWeight: '900' }}>
          {appt.dateISO} • {appt.time}
        </Text>
        <Text style={{ fontWeight: '800' }}>{clientName}</Text>
        <Text>
          {service?.name ?? 'Serviço'} • {service?.durationMin ?? 0}min • R$ {service?.price ?? 0}
        </Text>
        {appt.notes ? <Text style={{ opacity: 0.8 }}>Obs: {appt.notes}</Text> : null}
      </View>

      <Text style={{ fontWeight: '900' }}>Status</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatusBtn label="Agendado" value="SCHEDULED" />
        <StatusBtn label="Concluído" value="DONE" />
        <StatusBtn label="Cancelado" value="CANCELED" />
      </View>

      <Pressable
        onPress={() => {
          Alert.alert('Remover', 'Deseja remover este agendamento?', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Remover',
              style: 'destructive',
              onPress: () => {
                remove(appt.id);
                navigation.goBack();
              },
            },
          ]);
        }}
        style={{ marginTop: 'auto', padding: 14, borderRadius: 12, backgroundColor: '#eee' }}
      >
        <Text style={{ fontWeight: '900', textAlign: 'center' }}>Excluir agendamento</Text>
      </Pressable>
    </View>
  );
}
