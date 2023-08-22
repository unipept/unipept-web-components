import { DataNodeLike } from 'unipept-visualizations';
export interface Props {
    data: DataNodeLike;
    width?: number;
    height?: number;
    autoResize?: boolean;
    loading?: boolean;
    doReset?: boolean;
    linkStrokeColor?: (d: any) => string;
    nodeStrokeColor?: (d: any) => string;
    nodeFillColor?: (d: any) => string;
}
declare const _default: import("vue").DefineComponent<{
    data: {
        type: import("vue").PropType<DataNodeLike>;
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
    linkStrokeColor: {
        type: import("vue").PropType<(d: any) => string>;
    };
    nodeStrokeColor: {
        type: import("vue").PropType<(d: any) => string>;
    };
    nodeFillColor: {
        type: import("vue").PropType<(d: any) => string>;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "reset"[], "reset", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    data: {
        type: import("vue").PropType<DataNodeLike>;
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
    linkStrokeColor: {
        type: import("vue").PropType<(d: any) => string>;
    };
    nodeStrokeColor: {
        type: import("vue").PropType<(d: any) => string>;
    };
    nodeFillColor: {
        type: import("vue").PropType<(d: any) => string>;
    };
}>> & {
    onReset?: ((...args: any[]) => any) | undefined;
}, {
    width: number;
    height: number;
    loading: boolean;
    autoResize: boolean;
    doReset: boolean;
}, {}>;
export default _default;
