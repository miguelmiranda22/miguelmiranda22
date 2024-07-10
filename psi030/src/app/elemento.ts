export enum Resultado {
    "Passado" = "Passado",
    "Aviso" = "Aviso",
    "Falhado" = "Falhado",
    "Não aplicável" = "Não aplicável"
}

export interface Elemento {
    elemento: string;
    resultado: Resultado;
}