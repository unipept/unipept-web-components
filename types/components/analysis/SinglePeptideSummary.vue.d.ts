import { SinglePeptideAnalysisStatus } from '@/interface';
export interface Props {
    assay: SinglePeptideAnalysisStatus;
    goLink: boolean;
    ecLink: boolean;
    interproLink: boolean;
}
declare const _default: import("vue").DefineComponent<{
    assay: {
        type: import("vue").PropType<SinglePeptideAnalysisStatus>;
        required: true;
    };
    goLink: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    ecLink: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    interproLink: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("goLinkClicked" | "ecLinkClicked" | "interproLinkClicked")[], "goLinkClicked" | "ecLinkClicked" | "interproLinkClicked", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    assay: {
        type: import("vue").PropType<SinglePeptideAnalysisStatus>;
        required: true;
    };
    goLink: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    ecLink: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    interproLink: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}>> & {
    onGoLinkClicked?: ((...args: any[]) => any) | undefined;
    onEcLinkClicked?: ((...args: any[]) => any) | undefined;
    onInterproLinkClicked?: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
