import { Evaluation } from "./evaluation";

export enum EstadosPage{
    'Conforme', 'Não conforme', 'Por avaliar', 'Em avaliação', 'Erro na avaliação'
}

export interface Page{
    url: string;
    dataAval: Date;
    estado: EstadosPage;
    evaluation: Evaluation;
}