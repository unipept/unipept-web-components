import ImageSource from '@/logic/util/image/ImageSource';
export interface Props {
    openModal: boolean;
    supportsSvg?: boolean;
    imageSource: ImageSource | undefined;
}
declare const _default: import("vue").DefineComponent<{
    openModal: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    supportsSvg: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    imageSource: {
        type: import("vue").PropType<ImageSource | undefined>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "close"[], "close", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    openModal: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    supportsSvg: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    imageSource: {
        type: import("vue").PropType<ImageSource | undefined>;
        required: true;
    };
}>> & {
    onClose?: ((...args: any[]) => any) | undefined;
}, {
    supportsSvg: boolean;
}, {}>;
export default _default;
