export default class SvgUtils {
    public static elementToSvgDataUrl(element: SVGElement) {
        const svgString = new XMLSerializer().serializeToString(element);
        return SvgUtils.svgStringToSvgDataUrl(svgString);
    }

    public static svgStringToSvgDataUrl(svgString: string) {
        const decoded = unescape(encodeURIComponent(svgString));
        const base64 = btoa(decoded);
        return `data:image/svg+xml;base64,${base64}`;
    }
}
