import PngSource from "@/business/image/PngSource";
export default class DomElementToPngSource implements PngSource {
    private domElement;
    constructor(domElement: HTMLElement);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toDataUrl(scaling: number): Promise<string>;
}
