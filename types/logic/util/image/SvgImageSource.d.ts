import ImageSource from "./ImageSource";
export default class SvgImageSource implements ImageSource {
    private svgElement;
    constructor(svgElement: SVGElement);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toPngDataUrl(scaling: number): Promise<string>;
    toSvgDataUrl(): Promise<string>;
}
