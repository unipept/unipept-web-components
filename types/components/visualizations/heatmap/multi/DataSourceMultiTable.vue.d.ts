import DataSourceMultiItem from './DataSourceMultiItem';
export interface Props {
    items: DataSourceMultiItem[];
    categories: string[];
    loading: boolean;
    identifier?: boolean;
}
declare const _default: import("vue").DefineComponent<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    items: {
        type: import("vue").PropType<DataSourceMultiItem[]>;
        required: true;
    };
    categories: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    identifier: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    items: {
        type: import("vue").PropType<DataSourceMultiItem[]>;
        required: true;
    };
    categories: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
    identifier: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}>> & {
    onSelect?: ((...args: any[]) => any) | undefined;
}, {
    identifier: boolean;
}, {}>;
export default _default;
