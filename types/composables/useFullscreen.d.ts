import { ComponentPublicInstance } from "vue";
export default function useFullscreen(): {
    isFullscreen: import("vue").Ref<boolean>;
    toggle: (target?: HTMLElement | SVGElement | ComponentPublicInstance | null | undefined) => Promise<void>;
};
