export type ID = string;

export type Client = {
  id: ID;
  name: string;
  phone?: string;
};

export type Service = {
  id: ID;
  name: string;
  durationMin: number; // ex: 30, 45, 60
  price: number; // em reais
};

export type AppointmentStatus = 'SCHEDULED' | 'DONE' | 'CANCELED';

export type Appointment = {
  id: ID;
  dateISO: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  clientId: ID;
  serviceId: ID;
  notes?: string;
  status: AppointmentStatus;
  createdAt: number;
};
