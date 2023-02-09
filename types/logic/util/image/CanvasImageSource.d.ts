import ImageSource from "./ImageSource";
export default class CanvasImageSource implements ImageSource {
    private canvas;
    constructor(canvas: HTMLCanvasElement);
    getOriginalHeight(): number;
    getOriginalWidth(): number;
    toPngDataUrl(scaling: number): Promise<string>;
    toSvgDataUrl(): Promise<string>;
    private cloneCanvas;
}
