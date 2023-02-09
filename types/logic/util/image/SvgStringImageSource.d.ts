import ImageSource from "./ImageSource";
export default class SvgImageSource implements ImageSource {
    private svgString;
    constructor(svgString: string);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toPngDataUrl(scaling: number): Promise<string>;
    toSvgDataUrl(): Promise<string>;
}
