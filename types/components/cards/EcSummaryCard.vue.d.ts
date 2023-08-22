import { EcCode, EcDefinition, FunctionalCountTableProcessor, LcaCountTableProcessor, NcbiTree, Ontology } from '@/logic';
import { DataNodeLike } from 'unipept-visualizations/types';
export interface Props {
    analysisInProgress: boolean;
    showPercentage: boolean;
    filter: number;
    ecProcessor: FunctionalCountTableProcessor<EcCode, EcDefinition>;
    ecOntology: Ontology<EcCode, EcDefinition>;
    ecTree: DataNodeLike;
    ncbiProcessor?: LcaCountTableProcessor;
    ncbiTree?: NcbiTree;
    downloadItem?: (code: EcCode) => Promise<void>;
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
    ecProcessor: {
        type: import("vue").PropType<FunctionalCountTableProcessor<string, EcDefinition>>;
        required: true;
    };
    ecOntology: {
        type: import("vue").PropType<Ontology<string, EcDefinition>>;
        required: true;
    };
    ecTree: {
        type: import("vue").PropType<DataNodeLike>;
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
    ecProcessor: {
        type: import("vue").PropType<FunctionalCountTableProcessor<string, EcDefinition>>;
        required: true;
    };
    ecOntology: {
        type: import("vue").PropType<Ontology<string, EcDefinition>>;
        required: true;
    };
    ecTree: {
        type: import("vue").PropType<DataNodeLike>;
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
