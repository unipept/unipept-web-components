import { NcbiTree } from '@/logic';
export interface Props {
    tree: NcbiTree;
    equateIl: boolean;
    loading: boolean;
}
declare const _default: import("vue").DefineComponent<{
    tree: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
    equateIl: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    tree: {
        type: import("vue").PropType<NcbiTree>;
        required: true;
    };
    equateIl: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
}>>, {}, {}>;
export default _default;
