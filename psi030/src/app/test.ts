import { Elemento, Resultado } from "./elemento";

export enum TiposTeste{
    'Regra ACT' = 'Regra ACT',
    'Técnica WCAG' = 'Técnica WCAG'
}

export interface Test {
    _id: string;
    nome: string;
    tipo: TiposTeste;
    resultado: Resultado;
    nivel: string[];
    elementos: Elemento[],
}