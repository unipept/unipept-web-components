/*
Heavily based on https://github.com/vueuse/vueuse/tree/main/packages/core/useFullscreen

MIT License

Copyright (c) 2019-PRESENT Anthony Fu<https://github.com/antfu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
