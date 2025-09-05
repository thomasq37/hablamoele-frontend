export interface Categoria {
  id?: number;
  nombre: string | null;
}

/** Fabrique un objet vide “safe” pour init de formulaires */
export function createCategoria(init?: Partial<Categoria>): Categoria {
  return {
    nombre: null,
    ...init
  };
}
