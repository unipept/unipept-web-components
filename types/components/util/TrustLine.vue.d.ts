import { FunctionalTrust } from '@/logic';
export interface Props {
    trust: FunctionalTrust;
    faKind: {
        singular: string;
        plural: string;
    };
    countKind: {
        singular: string;
        plural: string;
    };
    clickable?: boolean;
}
declare const _default: import("vue").DefineComponent<{
    clickable: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    trust: {
        type: import("vue").PropType<FunctionalTrust>;
        required: true;
    };
    faKind: {
        type: import("vue").PropType<{
            singular: string;
            plural: string;
        }>;
        required: true;
    };
    countKind: {
        type: import("vue").PropType<{
            singular: string;
            plural: string;
        }>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    clickable: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
    trust: {
        type: import("vue").PropType<FunctionalTrust>;
        required: true;
    };
    faKind: {
        type: import("vue").PropType<{
            singular: string;
            plural: string;
        }>;
        required: true;
    };
    countKind: {
        type: import("vue").PropType<{
            singular: string;
            plural: string;
        }>;
        required: true;
    };
}>>, {
    clickable: boolean;
}, {}>;
export default _default;
