import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { useAppStore } from '../../app/store/useAppStore';

export default function ServicesScreen() {
  const services = useAppStore((s) => s.services);
  const upsertService = useAppStore((s) => s.upsertService);
  const removeService = useAppStore((s) => s.removeService);

  const [name, setName] = useState('');
  const [durationMin, setDurationMin] = useState('30');
  const [price, setPrice] = useState('50');

  const add = () => {
    const n = name.trim();
    const d = Number(durationMin);
    const p = Number(price);

    if (!n) return Alert.alert('Atenção', 'Informe o nome do serviço.');
    if (!Number.isFinite(d) || d <= 0) return Alert.alert('Atenção', 'Duração inválida.');
    if (!Number.isFinite(p) || p < 0) return Alert.alert('Atenção', 'Preço inválido.');

    upsertService({ name: n, durationMin: Math.round(d), price: Math.round(p * 100) / 100 });
    setName('');
    setDurationMin('30');
    setPrice('50');
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#f4f4f4', gap: 10 }}>
        <Text style={{ fontWeight: '900' }}>Novo serviço</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nome (ex: Corte)"
          style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff' }}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            value={durationMin}
            onChangeText={setDurationMin}
            placeholder="Duração (min)"
            keyboardType="number-pad"
            style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#fff' }}
          />
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Preço"
            keyboardType="decimal-pad"
            style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#fff' }}
          />
        </View>
        <Pressable onPress={add} style={{ padding: 12, borderRadius: 10, backgroundColor: '#111' }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Adicionar</Text>
        </Pressable>
      </View>

      <Text style={{ fontWeight: '900' }}>Serviços</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#f4f4f4',
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '900' }}>{item.name}</Text>
              <Text style={{ opacity: 0.7 }}>
                {item.durationMin}min • R$ {item.price}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert('Remover', `Remover ${item.name}?`, [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Remover', style: 'destructive', onPress: () => removeService(item.id) },
                ])
              }
              style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#eee' }}
            >
              <Text style={{ fontWeight: '900' }}>Excluir</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
