import { GoNamespace } from '@/logic';
import GoTableItem from '../tables/functional/GoTableItem';
export interface Props {
    items: GoTableItem[];
    namespace: GoNamespace;
    n: number;
}
declare const _default: import("vue").DefineComponent<{
    items: {
        type: import("vue").PropType<GoTableItem[]>;
        required: true;
    };
    namespace: {
        type: import("vue").PropType<GoNamespace>;
        required: true;
    };
    n: {
        type: import("vue").PropType<number>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: import("vue").PropType<GoTableItem[]>;
        required: true;
    };
    namespace: {
        type: import("vue").PropType<GoNamespace>;
        required: true;
    };
    n: {
        type: import("vue").PropType<number>;
        required: true;
    };
}>>, {}, {}>;
export default _default;
