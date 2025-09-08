import {Nivel} from "./nivel.model";
import {Categoria} from "./categoria.model";

export interface RecursosDTO {
  id?: number;
  banner?: string | null;
  titulo?: string | null;
  description?: string | null;
  tags?: string | null;
  categorias?: Categoria[];
  niveles?: Nivel[];
  nbInfografias: number;
}
