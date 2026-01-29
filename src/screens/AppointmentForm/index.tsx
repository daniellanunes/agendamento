import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation';
import { useAppStore } from '../../app/store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentForm'>;

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const dateToISO = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const timeToHHmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

export default function AppointmentFormScreen({ navigation, route }: Props) {
  const clients = useAppStore((s) => s.clients);
  const services = useAppStore((s) => s.services);
  const createAppointment = useAppStore((s) => s.createAppointment);

  const initialDate = useMemo(() => {
    const iso = route.params?.dateISO;
    if (!iso) return new Date();
    const [y, m, day] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, day ?? 1);
  }, [route.params?.dateISO]);

  const initialTime = useMemo(() => {
    const t = route.params?.time;
    if (!t) return new Date();
    const [hh, mm] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(hh ?? 9, mm ?? 0, 0, 0);
    return d;
  }, [route.params?.time]);

  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState<Date>(initialTime);

  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? '');
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? '');
  const [notes, setNotes] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedService = services.find((s) => s.id === serviceId);

  const onSave = () => {
    if (!clientId || !serviceId) {
      Alert.alert('Atenção', 'Selecione um cliente e um serviço.');
      return;
    }

    const payload = {
      dateISO: dateToISO(date),
      time: timeToHHmm(time),
      clientId,
      serviceId,
      notes: notes.trim() || undefined,
      status: 'SCHEDULED' as const,
    };

    const res = createAppointment(payload);
    if (!res.ok) {
      Alert.alert('Conflito de horário', res.error);
      return;
    }

    navigation.goBack();
  };

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: active ? '#111' : '#eee',
      }}
    >
      <Text style={{ color: active ? '#fff' : '#111', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 14 }}>
      {/* Cliente */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Cliente</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {clients.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={c.id === clientId}
              onPress={() => setClientId(c.id)}
            />
          ))}
        </View>
        {!clients.length ? (
          <Pressable
            onPress={() => navigation.navigate('Clients')}
            style={{ padding: 12, backgroundColor: '#eee', borderRadius: 10 }}
          >
            <Text style={{ fontWeight: '700' }}>Cadastrar clientes</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Serviço */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Serviço</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {services.map((s) => (
            <Chip
              key={s.id}
              label={`${s.name} • ${s.durationMin}min • R$ ${s.price}`}
              active={s.id === serviceId}
              onPress={() => setServiceId(s.id)}
            />
          ))}
        </View>
        {!services.length ? (
          <Pressable
            onPress={() => navigation.navigate('Services')}
            style={{ padding: 12, backgroundColor: '#eee', borderRadius: 10 }}
          >
            <Text style={{ fontWeight: '700' }}>Cadastrar serviços</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Data/Hora */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#f4f4f4' }}
        >
          <Text style={{ fontWeight: '800' }}>Data</Text>
          <Text>{dateToISO(date)}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#f4f4f4' }}
        >
          <Text style={{ fontWeight: '800' }}>Hora</Text>
          <Text>{timeToHHmm(time)}</Text>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) setDate(d);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            setShowTimePicker(false);
            if (d) setTime(d);
          }}
        />
      )}

      {/* Observação */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '800' }}>Observação (opcional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex: cliente pediu para atrasar 10min"
          multiline
          style={{
            minHeight: 90,
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#f4f4f4',
            textAlignVertical: 'top',
          }}
        />
      </View>

      {/* Resumo */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#eee', gap: 4 }}>
        <Text style={{ fontWeight: '900' }}>Resumo</Text>
        <Text>Cliente: {selectedClient?.name ?? '-'}</Text>
        <Text>Serviço: {selectedService?.name ?? '-'}</Text>
        <Text>Quando: {dateToISO(date)} às {timeToHHmm(time)}</Text>
      </View>

      <Pressable
        onPress={onSave}
        style={{ marginTop: 'auto', padding: 14, borderRadius: 12, backgroundColor: '#111' }}
      >
        <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Salvar agendamento</Text>
      </Pressable>
    </View>
  );
}
