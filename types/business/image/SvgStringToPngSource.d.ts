import PngSource from "@/business/image/PngSource";
export default class SvgStringToPngSource implements PngSource {
    private svgString;
    constructor(svgString: string);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toDataUrl(scaling: number): Promise<string>;
}
