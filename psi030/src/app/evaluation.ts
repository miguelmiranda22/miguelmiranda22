import { Test } from "./test";

export interface Evaluation{
    _id: string;
    tem_erro_A: Boolean;
    tem_erro_AA: Boolean;
    tem_erro_AAA: Boolean;
    erros: [];
    num_passed: number;
    num_warning: number;
    num_failed: number;
    num_inapplicable: number;
    tests: Test[];
}