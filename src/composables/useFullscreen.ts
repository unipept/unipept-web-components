import { ComponentPublicInstance, ref } from "vue";

type FunctionMap = [
    'requestFullscreen',
    'exitFullscreen',
    'fullscreenElement',
    'fullscreenEnabled',
    'fullscreenchange',
    'fullscreenerror',
];

const functionsMap: FunctionMap[] = [
    [
        "requestFullscreen",
        "exitFullscreen",
        "fullscreenElement",
        "fullscreenEnabled",
        "fullscreenchange",
        "fullscreenerror"
    ]
];

export default function useFullscreen() {
    const isFullscreen = ref<boolean>(false);

    const document: Document = window.document;

    const [REQUEST, EXIT, ELEMENT,, EVENT] = functionsMap[0];

    const exit = async () => {

        if (document?.[ELEMENT]) {
            await document[EXIT]();
        }

        isFullscreen.value = false;
    }

    const enter = async (target?: HTMLElement | SVGElement | ComponentPublicInstance | null | undefined) => {
        // TODO: supported stuff

        await exit();

        const targetRef = target || document?.querySelector('html');

        if(targetRef) {
            // @ts-ignore
            await targetRef.$el[REQUEST]();
            isFullscreen.value = true;
        }
    };

    const toggle = async (target?: HTMLElement | SVGElement | ComponentPublicInstance | null | undefined) => {
        if (isFullscreen.value) {
            await exit();
        } else {
            await enter(target);
        }
    };

    // Handles exits using the escape key or other methods
    if(document) {
        document.addEventListener(EVENT, () => {
            isFullscreen.value = !!document[ELEMENT];
        });
    }

    return {
        isFullscreen,

        toggle
    };
}
