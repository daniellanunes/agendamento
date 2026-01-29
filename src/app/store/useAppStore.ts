import { create } from 'zustand';
import { Appointment, Client, Service, ID } from '../types/models';
import { getJSON, setJSON } from '../utils/storage';

const STORAGE_KEY = '@agendamentos_demo_v1';

const uid = (): ID => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

type State = {
  hydrated: boolean;

  clients: Client[];
  services: Service[];
  appointments: Appointment[];

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  upsertClient: (c: Omit<Client, 'id'> & { id?: ID }) => void;
  removeClient: (id: ID) => void;

  upsertService: (s: Omit<Service, 'id'> & { id?: ID }) => void;
  removeService: (id: ID) => void;

  createAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => { ok: true } | { ok: false; error: string };
  updateAppointmentStatus: (id: ID, status: Appointment['status']) => void;
  removeAppointment: (id: ID) => void;
};

type Persisted = Pick<State, 'clients' | 'services' | 'appointments'>;

export const useAppStore = create<State>((set, get) => ({
  hydrated: false,

  // Seeds simples pra aparecer algo no demo
  clients: [
    { id: 'c1', name: 'Daniel', phone: '(11) 99999-9999' },
    { id: 'c2', name: 'Maria', phone: '(11) 98888-8888' },
  ],
  services: [
    { id: 's1', name: 'Corte', durationMin: 30, price: 40 },
    { id: 's2', name: 'Barba', durationMin: 20, price: 25 },
  ],
  appointments: [],

  hydrate: async () => {
    const data = await getJSON<Persisted>(STORAGE_KEY, {
      clients: get().clients,
      services: get().services,
      appointments: [],
    });
    set({ ...data, hydrated: true });
  },

  persist: async () => {
    const { clients, services, appointments } = get();
    await setJSON(STORAGE_KEY, { clients, services, appointments } satisfies Persisted);
  },

  upsertClient: (c) => {
    const id = c.id ?? uid();
    set((state) => {
      const exists = state.clients.some((x) => x.id === id);
      const clients = exists
        ? state.clients.map((x) => (x.id === id ? { ...x, ...c, id } : x))
        : [{ id, name: c.name, phone: c.phone }, ...state.clients];
      return { clients };
    });
    void get().persist();
  },

  removeClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
      appointments: state.appointments.filter((a) => a.clientId !== id),
    }));
    void get().persist();
  },

  upsertService: (s) => {
    const id = s.id ?? uid();
    set((state) => {
      const exists = state.services.some((x) => x.id === id);
      const services = exists
        ? state.services.map((x) => (x.id === id ? { ...x, ...s, id } : x))
        : [{ id, name: s.name, durationMin: s.durationMin, price: s.price }, ...state.services];
      return { services };
    });
    void get().persist();
  },

  removeService: (id) => {
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
      appointments: state.appointments.filter((a) => a.serviceId !== id),
    }));
    void get().persist();
  },

  // Regra: não pode dois agendamentos no mesmo dia/hora (se não cancelado)
  createAppointment: (a) => {
    const conflict = get().appointments.some(
      (x) => x.dateISO === a.dateISO && x.time === a.time && x.status !== 'CANCELED'
    );
    if (conflict) return { ok: false, error: 'Já existe um agendamento neste horário.' };

    const appointment: Appointment = { ...a, id: uid(), createdAt: Date.now() };
    set((state) => ({ appointments: [appointment, ...state.appointments] }));
    void get().persist();
    return { ok: true };
  },

  updateAppointmentStatus: (id, status) => {
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
    void get().persist();
  },

  removeAppointment: (id) => {
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
    void get().persist();
  },
}));
