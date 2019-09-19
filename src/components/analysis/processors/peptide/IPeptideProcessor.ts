import PeptideContainer from "../../../../logic/data-management/PeptideContainer";

export interface IPeptideProcessor{
    process(peptides: PeptideContainer): Promise<string>;
}