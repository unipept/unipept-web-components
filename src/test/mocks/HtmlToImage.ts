export default class HtmlToImage {
    public async toSvgDataURL(url: string): Promise<string> {
        // Just do nothing and return the same url.
        return url;
    }

    public async toPng(domNode: HTMLElement, options?) {
        return "nothing";
    }
}
