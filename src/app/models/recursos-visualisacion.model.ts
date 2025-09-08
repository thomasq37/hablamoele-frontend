import {Recursos} from "./recursos.model";

export interface RecursosVisualisacion {
  id?: number;
  dateVisualisacion: string;
  ip: string;
  recursos: Recursos;
}
