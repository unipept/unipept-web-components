import PngSource from "@/business/image/PngSource";
import PngUtils from "@/business/image/PngUtils";

export default class DomElementToPngSource implements PngSource {
    constructor(
        private domElement: HTMLElement
    ) {}

    public getOriginalHeight(): number {
        return this.domElement.clientHeight;
    }

    public getOriginalWidth(): number {
        return this.domElement.clientWidth;
    }

    public toDataUrl(scaling: number): Promise<string> {
        return PngUtils.htmlElementToPngDataUrl(this.domElement, scaling);
    }
}
