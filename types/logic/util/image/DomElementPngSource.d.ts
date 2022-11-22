import PngSource from "./PngSource";
export default class DomElementPngSource implements PngSource {
    private domElement;
    constructor(domElement: HTMLElement);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toPngDataUrl(scaling: number): Promise<string>;
}
