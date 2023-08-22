import { FunctionalCode, InterproCode, NcbiId, NcbiTree, Peptide } from '@/logic';
import InterproTableItem from './InterproTableItem';
export interface Props {
    items: InterproTableItem[];
    loading: boolean;
    showPercentage: boolean;
    ncbiTree?: NcbiTree;
    taxaToPeptides?: Map<NcbiId, Peptide[]>;
    itemToPeptides?: Map<InterproCode, Peptide[]>;
    downloadItem?: (code: FunctionalCode) => Promise<void>;
}
declare const _default: import("vue").DefineComponent<{
    items: {
        type: import("vue").PropType<InterproTableItem[]>;
        required: true;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    showPercentage: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    ncbiTree: {
        type: import("vue").PropType<NcbiTree>;
    };
    taxaToPeptides: {
        type: import("vue").PropType<Map<number, string[]>>;
    };
    itemToPeptides: {
        type: import("vue").PropType<Map<string, string[]>>;
    };
    downloadItem: {
        type: import("vue").PropType<(code: string) => Promise<void>>;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: import("vue").PropType<InterproTableItem[]>;
        required: true;
    };
    loading: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    showPercentage: {
        type: import("vue").PropType<boolean>;
        required: true;
    };
    ncbiTree: {
        type: import("vue").PropType<NcbiTree>;
    };
    taxaToPeptides: {
        type: import("vue").PropType<Map<number, string[]>>;
    };
    itemToPeptides: {
        type: import("vue").PropType<Map<string, string[]>>;
    };
    downloadItem: {
        type: import("vue").PropType<(code: string) => Promise<void>>;
    };
}>>, {}, {}>;
export default _default;
