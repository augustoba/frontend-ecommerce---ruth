/** Turno de un vendedor/cajero: abierto/cerrado con hora, espejo de `ShiftResponse` del backend. */
export interface Shift {
  id: string;
  userDni: string;
  userName: string;
  openedAt: string;
  closedAt?: string | null;
}
