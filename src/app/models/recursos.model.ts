export interface Recursos {
  id?: number;             // optionnel à la création
  banner?: string | null;  // LONGTEXT côté back
  titulo?: string | null;
  description?: string | null;
  tags?: string | null;
  infografias?: string[];  // LONGTEXT côté back pour chaque élément
}

/** Fabrique un objeto vacío “safe” pour init de formulaires */
export function createRecursos(init?: Partial<Recursos>): Recursos {
  return {
    banner: null,
    titulo: null,
    description: null,
    tags: null,
    infografias: [],
    ...init
  };
}
