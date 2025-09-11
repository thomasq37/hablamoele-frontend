import {Nivel} from "./nivel.model";
import {Categoria} from "./categoria.model";

export interface Recursos {
  id?: number;
  banner?: string | null;
  titulo?: string | null;
  description?: string | null;
  tags?: string | null;
  infografias?: string[];
  categorias?: Categoria[];
  niveles?: Nivel[];
  nbInfografias: number;
  nbCahiersActivite: number;
}
