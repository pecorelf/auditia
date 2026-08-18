import { create } from "zustand";

export type Espacio = "uno" | "dos" | "tres" | "cuatro" | "cinco" | "seis" | "admin";

export type User = {
  id: string;
  name: string;
  role: string;
  avatar: string; // initials
};

const USERS: User[] = [
  { id: "fb", name: "Fernando Briones", role: "Socio Auditoría Interna", avatar: "FB" },
  { id: "po", name: "Paula Ortiz", role: "Senior Manager", avatar: "PO" },
  { id: "ds", name: "Daniel Soto", role: "Manager Tech & Data", avatar: "DS" },
  { id: "jm", name: "Jaime Mendoza", role: "Director T&T", avatar: "JM" },
];

type Store = {
  user: User | null;
  espacio: Espacio;
  users: User[];
  login: (id: string) => void;
  logout: () => void;
  setEspacio: (e: Espacio) => void;
};

export const useStore = create<Store>((set) => ({
  user: null,
  espacio: "uno",
  users: USERS,
  login: (id) =>
    set((s) => ({ user: s.users.find((u) => u.id === id) || null })),
  logout: () => set({ user: null, espacio: "uno" }),
  setEspacio: (e) => set({ espacio: e }),
}));
