export interface Props {
    data: number[][];
    rowLabels: string[];
    columnLabels: string[];
    width?: number;
    height?: number;
    loading?: boolean;
    doReset?: boolean;
    clusterRows?: boolean;
    clusterColumns?: boolean;
    rotated?: boolean;
    fullscreen?: boolean;
    download?: boolean;
}
declare const _default: import("vue").DefineComponent<{
    data: {
        type: import("vue").PropType<number[][]>;
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
    download: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    fullscreen: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    doReset: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    rowLabels: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    columnLabels: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    clusterRows: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    clusterColumns: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    rotated: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("reset" | "download")[], "reset" | "download", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    data: {
        type: import("vue").PropType<number[][]>;
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
    download: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    fullscreen: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    doReset: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    rowLabels: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    columnLabels: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    clusterRows: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    clusterColumns: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    rotated: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}>> & {
    onReset?: ((...args: any[]) => any) | undefined;
    onDownload?: ((...args: any[]) => any) | undefined;
}, {
    width: number;
    height: number;
    loading: boolean;
    download: boolean;
    fullscreen: boolean;
    doReset: boolean;
    clusterRows: boolean;
    clusterColumns: boolean;
    rotated: boolean;
}, {}>;
export default _default;
