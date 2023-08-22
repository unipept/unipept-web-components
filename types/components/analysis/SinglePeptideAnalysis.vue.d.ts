import { SinglePeptideAnalysisStatus } from "@/interface";
export interface Props {
    assay: SinglePeptideAnalysisStatus;
    tab?: string;
}
declare const _default: import("vue").DefineComponent<{
    assay: {
        type: import("vue").PropType<SinglePeptideAnalysisStatus>;
        required: true;
    };
    tab: {
        type: import("vue").PropType<string>;
        default: string;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "tabUpdate"[], "tabUpdate", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    assay: {
        type: import("vue").PropType<SinglePeptideAnalysisStatus>;
        required: true;
    };
    tab: {
        type: import("vue").PropType<string>;
        default: string;
    };
}>> & {
    onTabUpdate?: ((...args: any[]) => any) | undefined;
}, {
    tab: string;
}, {}>;
export default _default;
