export interface Props {
    modelValue: number;
    openModal: boolean;
}
declare const _default: import("vue").DefineComponent<{
    modelValue: {
        type: import("vue").PropType<number>;
        required: true;
    };
    openModal: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("close" | "update:model-value")[], "close" | "update:model-value", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: import("vue").PropType<number>;
        required: true;
    };
    openModal: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}>> & {
    onClose?: ((...args: any[]) => any) | undefined;
    "onUpdate:model-value"?: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
