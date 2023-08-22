import MultiProteomicsAnalysisStatus from "@/interface/MultiProteomicsAnalysisStatus";
export interface Props {
    loading: boolean;
    assays: MultiProteomicsAnalysisStatus[];
}
declare const _default: import("vue").DefineComponent<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    assays: {
        type: import("vue").PropType<MultiProteomicsAnalysisStatus[]>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    assays: {
        type: import("vue").PropType<MultiProteomicsAnalysisStatus[]>;
        required: true;
    };
}>>, {}, {}>;
export default _default;
