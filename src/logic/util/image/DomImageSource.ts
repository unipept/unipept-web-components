import { toPng, toSvg } from "html-to-image";
import ImageSource from "./ImageSource";

export default class DomImageSource implements ImageSource {
    constructor(
        private domElement: HTMLElement
    ) {}

    public getOriginalHeight(): number {
        return this.domElement.clientHeight;
    }

    public getOriginalWidth(): number {
        return this.domElement.clientWidth;
    }

    public async toPngDataUrl(scaling: number): Promise<string> {
        return await toPng(this.domElement, { pixelRatio: scaling });
    }

    public async toSvgDataUrl(): Promise<string> {
        return await toSvg(this.domElement);
    }
}
