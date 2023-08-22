export interface Props {
    caption: string;
    loading: boolean;
    overlap?: boolean;
    hideDownload?: boolean;
    internalDownload?: boolean;
    settings?: boolean;
    rotate?: () => void;
    download?: () => void;
    reset?: () => void;
    fullscreen?: () => void;
}
declare const _default: __VLS_WithTemplateSlots<import("vue").DefineComponent<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    reset: {
        type: import("vue").PropType<() => void>;
    };
    caption: {
        type: import("vue").PropType<string>;
        required: true;
    };
    overlap: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    download: {
        type: import("vue").PropType<() => void>;
    };
    fullscreen: {
        type: import("vue").PropType<() => void>;
    };
    rotate: {
        type: import("vue").PropType<() => void>;
    };
    hideDownload: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    internalDownload: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    settings: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    reset: {
        type: import("vue").PropType<() => void>;
    };
    caption: {
        type: import("vue").PropType<string>;
        required: true;
    };
    overlap: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    download: {
        type: import("vue").PropType<() => void>;
    };
    fullscreen: {
        type: import("vue").PropType<() => void>;
    };
    rotate: {
        type: import("vue").PropType<() => void>;
    };
    hideDownload: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    internalDownload: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    settings: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}>>, {
    overlap: boolean;
    hideDownload: boolean;
    internalDownload: boolean;
    settings: boolean;
}, {}>, {
    settings?(_: {}): any;
    visualization?(_: {}): any;
}>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
