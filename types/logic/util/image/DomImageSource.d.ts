import ImageSource from "./ImageSource";
export default class DomImageSource implements ImageSource {
    private domElement;
    constructor(domElement: HTMLElement);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toPngDataUrl(scaling: number): Promise<string>;
    toSvgDataUrl(): Promise<string>;
}
