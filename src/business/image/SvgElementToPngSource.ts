import PngSource from "@/business/image/PngSource";
import PngUtils from "@/business/image/PngUtils";

/**
 * This class implements the PngSource interface and provides some generic methods that convert SVG-data to a
 * PNG-element.
 */
export default class SvgElementToPngSource implements PngSource {
    constructor(private element: SVGElement) {}

    public async toDataUrl(scaling: number): Promise<string> {
        return PngUtils.svgElementToPngDataUrl(this.element, scaling);
    }

    public getOriginalWidth(): number {
        return this.element.clientWidth;
    }

    public getOriginalHeight(): number {
        return this.element.clientHeight;
    }
}
