export interface Horse {
  id: string;
  name: string;
  level: "principiante" | "intermedio" | "avanzado";
  available: boolean;
  image: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  credits: number;
  totalSpent: number;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  horseId: string;
  horseName: string;
  date: string;
  time: string;
  status: "confirmada" | "pendiente" | "cancelada";
  paid: boolean;
}

export interface WaitlistEntry {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  position: number;
}

export const horses: Horse[] = [
  { id: "h1", name: "Luna", level: "principiante", available: true, image: "🐴" },
  { id: "h2", name: "Trueno", level: "avanzado", available: true, image: "🐎" },
  { id: "h3", name: "Estrella", level: "intermedio", available: false, image: "🐴" },
  { id: "h4", name: "Caramelo", level: "principiante", available: true, image: "🐎" },
  { id: "h5", name: "Brisa", level: "intermedio", available: true, image: "🐴" },
  { id: "h6", name: "Relámpago", level: "avanzado", available: false, image: "🐎" },
];

export const students: Student[] = [
  { id: "s1", name: "María García", email: "maria@email.com", phone: "+34 612 345 678", credits: 7, totalSpent: 450 },
  { id: "s2", name: "Carlos López", email: "carlos@email.com", phone: "+34 623 456 789", credits: 2, totalSpent: 800 },
  { id: "s3", name: "Ana Martínez", email: "ana@email.com", phone: "+34 634 567 890", credits: 0, totalSpent: 300 },
  { id: "s4", name: "Pedro Ruiz", email: "pedro@email.com", phone: "+34 645 678 901", credits: 10, totalSpent: 1200 },
  { id: "s5", name: "Laura Sánchez", email: "laura@email.com", phone: "+34 656 789 012", credits: 4, totalSpent: 600 },
];

export const todayBookings: Booking[] = [
  { id: "b1", studentId: "s1", studentName: "María García", horseId: "h1", horseName: "Luna", date: "2026-04-06", time: "09:00", status: "confirmada", paid: true },
  { id: "b2", studentId: "s2", studentName: "Carlos López", horseId: "h2", horseName: "Trueno", date: "2026-04-06", time: "09:00", status: "confirmada", paid: false },
  { id: "b3", studentId: "s4", studentName: "Pedro Ruiz", horseId: "h4", horseName: "Caramelo", date: "2026-04-06", time: "10:00", status: "confirmada", paid: true },
  { id: "b4", studentId: "s5", studentName: "Laura Sánchez", horseId: "h5", horseName: "Brisa", date: "2026-04-06", time: "11:00", status: "pendiente", paid: false },
  { id: "b5", studentId: "s1", studentName: "María García", horseId: "h1", horseName: "Luna", date: "2026-04-06", time: "12:00", status: "confirmada", paid: true },
];

export const waitlist: WaitlistEntry[] = [
  { id: "w1", studentId: "s3", studentName: "Ana Martínez", date: "2026-04-06", time: "09:00", position: 1 },
  { id: "w2", studentId: "s5", studentName: "Laura Sánchez", date: "2026-04-06", time: "10:00", position: 1 },
];

export const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00"];

export const pricePerCredit = 35;
