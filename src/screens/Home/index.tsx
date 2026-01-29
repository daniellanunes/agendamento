import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation';
import { useAppStore } from '../../app/store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const addDays = (iso: string, delta: number) => {
  const [y, m, day] = iso.split('-').map(Number);
  const d = new Date(y, (m ?? 1) - 1, day ?? 1);
  d.setDate(d.getDate() + delta);
  return toISO(d);
};

const todayISO = () => toISO(new Date());

const makeSlots = (startHour = 8, endHour = 19, stepMin = 30) => {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      if (h === endHour && m > 0) break;
      slots.push(`${pad2(h)}:${pad2(m)}`);
    }
  }
  return slots;
};

const SLOTS = makeSlots(8, 19, 30);

export default function HomeScreen({ navigation }: Props) {
  const [dateISO, setDateISO] = useState(todayISO());

  const appointments = useAppStore((s) => s.appointments);
  const clients = useAppStore((s) => s.clients);
  const services = useAppStore((s) => s.services);

  const apptsByTime = useMemo(() => {
    const map = new Map<string, (typeof appointments)[number]>();
    appointments
      .filter((a) => a.dateISO === dateISO)
      .forEach((a) => map.set(a.time, a));
    return map;
  }, [appointments, dateISO]);

  const resolveClient = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? 'Cliente';

  const resolveService = (serviceId: string) =>
    services.find((s) => s.id === serviceId);

  const StatusPill = ({ status }: { status: 'SCHEDULED' | 'DONE' | 'CANCELED' }) => {
    const bg =
      status === 'SCHEDULED' ? '#111' : status === 'DONE' ? '#2a2a2a' : '#777';
    const label =
      status === 'SCHEDULED' ? 'Agendado' : status === 'DONE' ? 'Concluído' : 'Cancelado';

    return (
      <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: bg }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {/* Top actions */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => navigation.navigate('AppointmentForm', { dateISO })}
          style={{ padding: 12, backgroundColor: '#111', borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Novo</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Clients')}
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 10 }}
        >
          <Text style={{ fontWeight: '700' }}>Clientes</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Services')}
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 10 }}
        >
          <Text style={{ fontWeight: '700' }}>Serviços</Text>
        </Pressable>
      </View>

      {/* Day selector */}
      <View
        style={{
          padding: 12,
          borderRadius: 12,
          backgroundColor: '#f4f4f4',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => setDateISO((d) => addDays(d, -1))}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#eee' }}
        >
          <Text style={{ fontWeight: '900' }}>◀</Text>
        </Pressable>

        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '900' }}>{dateISO}</Text>
          {dateISO !== todayISO() ? (
            <Pressable onPress={() => setDateISO(todayISO())} style={{ marginTop: 2 }}>
              <Text style={{ fontWeight: '800', textDecorationLine: 'underline' }}>Voltar para hoje</Text>
            </Pressable>
          ) : (
            <Text style={{ opacity: 0.7 }}>Hoje</Text>
          )}
        </View>

        <Pressable
          onPress={() => setDateISO((d) => addDays(d, 1))}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#eee' }}
        >
          <Text style={{ fontWeight: '900' }}>▶</Text>
        </Pressable>
      </View>

      {/* Timeline */}
      <FlatList
        data={SLOTS}
        keyExtractor={(t) => t}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item: time }) => {
          const appt = apptsByTime.get(time);
          const occupied = !!appt;

          if (!occupied) {
            return (
              <View
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#f4f4f4',
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontWeight: '900', fontSize: 16 }}>{time}</Text>
                  <Text style={{ opacity: 0.7 }}>Livre</Text>
                </View>

                <Pressable
                  onPress={() => navigation.navigate('AppointmentForm', { dateISO, time })}
                  style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#111' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Agendar</Text>
                </Pressable>
              </View>
            );
          }

          const clientName = resolveClient(appt!.clientId);
          const svc = resolveService(appt!.serviceId);

          return (
            <Pressable
              onPress={() => navigation.navigate('AppointmentDetails', { id: appt!.id })}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#f4f4f4',
                marginBottom: 10,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '900', fontSize: 16 }}>{time}</Text>
                <StatusPill status={appt!.status} />
              </View>

              <Text style={{ fontWeight: '900' }}>{clientName}</Text>
              <Text>
                {svc?.name ?? 'Serviço'} • {svc?.durationMin ?? 0}min • R$ {svc?.price ?? 0}
              </Text>

              {appt!.notes ? <Text style={{ opacity: 0.7 }}>Obs: {appt!.notes}</Text> : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
