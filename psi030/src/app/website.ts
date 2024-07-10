import { Page } from "./page"

export enum EstadosWebsite{
    'Por avaliar' = 'Por avaliar',
    'Em avaliação' = 'Em avaliação',
    'Avaliado' = 'Avaliado',
    'Erro na avaliação' = 'Erro na avaliação'
}

export interface Website{
    url: string;
    dataRegisto: Date;
    dataAval: Date;
    pages: Page[];
    estado: EstadosWebsite;
}