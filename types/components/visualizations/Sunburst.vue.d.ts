import { NcbiTree } from '@/logic';
export interface Props {
    data: NcbiTree;
    width?: number;
    height?: number;
    autoResize?: boolean;
    isFixedColors?: boolean;
    filterId: number;
    loading?: boolean;
    doReset?: boolean;
}
declare const _default: import("vue").DefineComponent<{
    data: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
    width: {
        type: import("vue").PropType<number>;
        default: number;
    };
    height: {
        type: import("vue").PropType<number>;
        default: number;
    };
    loading: {
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
    isFixedColors: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("reset" | "update-selected-taxon-id")[], "reset" | "update-selected-taxon-id", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    data: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
    width: {
        type: import("vue").PropType<number>;
        default: number;
    };
    height: {
        type: import("vue").PropType<number>;
        default: number;
    };
    loading: {
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
    isFixedColors: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}>> & {
    onReset?: ((...args: any[]) => any) | undefined;
    "onUpdate-selected-taxon-id"?: ((...args: any[]) => any) | undefined;
}, {
    width: number;
    height: number;
    loading: boolean;
    autoResize: boolean;
    doReset: boolean;
    filterId: number;
    isFixedColors: boolean;
}, {}>;
export default _default;
