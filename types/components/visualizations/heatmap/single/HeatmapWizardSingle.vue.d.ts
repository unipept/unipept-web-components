import { EcCode, EcCountTableProcessor, EcDefinition, GoCode, GoCountTableProcessor, GoDefinition, InterproCode, InterproCountTableProcessor, InterproDefinition, LcaCountTableProcessor, NcbiId, NcbiTaxon, NcbiTree, Ontology } from '@/logic';
export interface Props {
    loading: boolean;
    goCountTableProcessor: GoCountTableProcessor;
    goOntology: Ontology<GoCode, GoDefinition>;
    ecCountTableProcessor: EcCountTableProcessor;
    ecOntology: Ontology<EcCode, EcDefinition>;
    interproCountTableProcessor: InterproCountTableProcessor;
    interproOntology: Ontology<InterproCode, InterproDefinition>;
    ncbiCountTableProcessor: LcaCountTableProcessor;
    ncbiOntology: Ontology<NcbiId, NcbiTaxon>;
    ncbiTree: NcbiTree;
}
declare const _default: import("vue").DefineComponent<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    goCountTableProcessor: {
        type: import("vue").PropType<GoCountTableProcessor>;
        required: true;
    };
    goOntology: {
        type: import("vue").PropType<Ontology<string, GoDefinition>>;
        required: true;
    };
    ecCountTableProcessor: {
        type: import("vue").PropType<EcCountTableProcessor>;
        required: true;
    };
    ecOntology: {
        type: import("vue").PropType<Ontology<string, EcDefinition>>;
        required: true;
    };
    interproCountTableProcessor: {
        type: import("vue").PropType<InterproCountTableProcessor>;
        required: true;
    };
    interproOntology: {
        type: import("vue").PropType<Ontology<string, InterproDefinition>>;
        required: true;
    };
    ncbiCountTableProcessor: {
        type: import("vue").PropType<LcaCountTableProcessor>;
        required: true;
    };
    ncbiOntology: {
        type: import("vue").PropType<Ontology<number, NcbiTaxon>>;
        required: true;
    };
    ncbiTree: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    goCountTableProcessor: {
        type: import("vue").PropType<GoCountTableProcessor>;
        required: true;
    };
    goOntology: {
        type: import("vue").PropType<Ontology<string, GoDefinition>>;
        required: true;
    };
    ecCountTableProcessor: {
        type: import("vue").PropType<EcCountTableProcessor>;
        required: true;
    };
    ecOntology: {
        type: import("vue").PropType<Ontology<string, EcDefinition>>;
        required: true;
    };
    interproCountTableProcessor: {
        type: import("vue").PropType<InterproCountTableProcessor>;
        required: true;
    };
    interproOntology: {
        type: import("vue").PropType<Ontology<string, InterproDefinition>>;
        required: true;
    };
    ncbiCountTableProcessor: {
        type: import("vue").PropType<LcaCountTableProcessor>;
        required: true;
    };
    ncbiOntology: {
        type: import("vue").PropType<Ontology<number, NcbiTaxon>>;
        required: true;
    };
    ncbiTree: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
}>>, {}, {}>;
export default _default;
