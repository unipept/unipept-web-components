import { FunctionalCountTableProcessor, GoCode, GoDefinition, LcaCountTableProcessor, NcbiTree, Ontology } from '@/logic';
export interface Props {
    analysisInProgress: boolean;
    showPercentage: boolean;
    filter: number;
    goProcessor: FunctionalCountTableProcessor<GoCode, GoDefinition>;
    goOntology: Ontology<GoCode, GoDefinition>;
    ncbiProcessor?: LcaCountTableProcessor;
    ncbiTree?: NcbiTree;
    downloadItem?: (code: GoCode) => Promise<void>;
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
    goProcessor: {
        type: import("vue").PropType<FunctionalCountTableProcessor<string, GoDefinition>>;
        required: true;
    };
    goOntology: {
        type: import("vue").PropType<Ontology<string, GoDefinition>>;
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
    goProcessor: {
        type: import("vue").PropType<FunctionalCountTableProcessor<string, GoDefinition>>;
        required: true;
    };
    goOntology: {
        type: import("vue").PropType<Ontology<string, GoDefinition>>;
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
