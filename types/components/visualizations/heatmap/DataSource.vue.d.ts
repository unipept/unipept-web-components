export interface Props {
    items: any[];
    categories: string[];
    headers: any[];
    loading: boolean;
}
declare const _default: import("vue").DefineComponent<{
    items: {
        type: import("vue").PropType<any[]>;
        required: true;
    };
    categories: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    headers: {
        type: import("vue").PropType<any[]>;
        required: true;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: import("vue").PropType<any[]>;
        required: true;
    };
    categories: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    headers: {
        type: import("vue").PropType<any[]>;
        required: true;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}>> & {
    onSelect?: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
