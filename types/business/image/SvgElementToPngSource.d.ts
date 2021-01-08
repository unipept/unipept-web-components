import PngSource from "@/business/image/PngSource";
/**
 * This class implements the PngSource interface and provides some generic methods that convert SVG-data to a
 * PNG-element.
 */
export default class SvgElementToPngSource implements PngSource {
    private element;
    constructor(element: SVGElement);
    toDataUrl(scaling: number): Promise<string>;
    getOriginalWidth(): number;
    getOriginalHeight(): number;
}
