export default class PngUtils {
    static htmlElementToPngDataUrl(element: HTMLElement): Promise<string>;
    static svgElementToPngDataUrl(element: SVGElement, scalingFactor: number): Promise<string>;
    static svgStringToPngDataUrl(svgString: string, originalWidth: number, originalHeight: number, scalingFactor: number): Promise<string>;
    static canvasElementToPngDataUrl(element: HTMLCanvasElement): string;
}
