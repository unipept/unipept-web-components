import { NcbiTree } from '@/logic';
export interface Props {
    data: NcbiTree;
    width?: number;
    height?: number;
    autoResize?: boolean;
    filterId: number;
    loading?: boolean;
    doReset?: boolean;
    fullscreen?: boolean;
}
declare const _default: import("vue").DefineComponent<{
    data: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
    width: {
        type: import("vue").PropType<number>;
    };
    height: {
        type: import("vue").PropType<number>;
        default: number;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    fullscreen: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    autoResize: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    doReset: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    filterId: {
        type: import("vue").PropType<number>;
        required: true;
        default: number;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("reset" | "update-selected-taxon-id")[], "reset" | "update-selected-taxon-id", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    data: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
    width: {
        type: import("vue").PropType<number>;
    };
    height: {
        type: import("vue").PropType<number>;
        default: number;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    fullscreen: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    autoResize: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    doReset: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    filterId: {
        type: import("vue").PropType<number>;
        required: true;
        default: number;
    };
}>> & {
    onReset?: ((...args: any[]) => any) | undefined;
    "onUpdate-selected-taxon-id"?: ((...args: any[]) => any) | undefined;
}, {
    height: number;
    loading: boolean;
    fullscreen: boolean;
    autoResize: boolean;
    doReset: boolean;
    filterId: number;
}, {}>;
export default _default;
