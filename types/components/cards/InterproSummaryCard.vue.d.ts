import { FunctionalCountTableProcessor, InterproCode, InterproDefinition, LcaCountTableProcessor, NcbiTree, Ontology } from '@/logic';
export interface Props {
    analysisInProgress: boolean;
    showPercentage: boolean;
    filter: number;
    interproProcessor: FunctionalCountTableProcessor<InterproCode, InterproDefinition>;
    interproOntology: Ontology<InterproCode, InterproDefinition>;
    ncbiProcessor?: LcaCountTableProcessor;
    ncbiTree?: NcbiTree;
    downloadItem?: (code: InterproCode) => Promise<void>;
}
declare const _default: import("vue").DefineComponent<{
    analysisInProgress: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    showPercentage: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    filter: {
        type: import("vue").PropType<number>;
        required: true;
    };
    interproProcessor: {
        type: import("vue").PropType<FunctionalCountTableProcessor<string, InterproDefinition>>;
        required: true;
    };
    interproOntology: {
        type: import("vue").PropType<Ontology<string, InterproDefinition>>;
        required: true;
    };
    ncbiProcessor: {
        type: import("vue").PropType<LcaCountTableProcessor>;
    };
    ncbiTree: {
        type: import("vue").PropType<NcbiTree>;
    };
    downloadItem: {
        type: import("vue").PropType<(code: string) => Promise<void>>;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "filterPercentageChange"[], "filterPercentageChange", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    analysisInProgress: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    showPercentage: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    filter: {
        type: import("vue").PropType<number>;
        required: true;
    };
    interproProcessor: {
        type: import("vue").PropType<FunctionalCountTableProcessor<string, InterproDefinition>>;
        required: true;
    };
    interproOntology: {
        type: import("vue").PropType<Ontology<string, InterproDefinition>>;
        required: true;
    };
    ncbiProcessor: {
        type: import("vue").PropType<LcaCountTableProcessor>;
    };
    ncbiTree: {
        type: import("vue").PropType<NcbiTree>;
    };
    downloadItem: {
        type: import("vue").PropType<(code: string) => Promise<void>>;
    };
}>> & {
    onFilterPercentageChange?: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
