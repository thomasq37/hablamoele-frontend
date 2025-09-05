export interface Nivel {
  id?: number;
  nombre: string | null;
}

/** Fabrique un objet vide “safe” pour init de formulaires */
export function createNivel(init?: Partial<Nivel>): Nivel {
  return {
    nombre: null,
    ...init
  };
}
