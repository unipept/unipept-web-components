/**
 * Mock for a clipboard that can only be used to read and write text from. Calls to the methods off this clipboard
 * can be checked by Jest.
 *
 * @author Pieter Verschaffelt
 */
export default class ClipboardMock {
    private clipboardContents: string = "";

    public async read(): Promise<DataTransfer> {
        return null;
    }

    public async readText(): Promise<string> {
        return this.clipboardContents;
    }

    public async write(data: DataTransfer): Promise<void> {}

    public async writeText(data: string): Promise<void> {
        this.clipboardContents = data;
    }

    public addEventListener(x: any) {
        throw "NotSupportedByMock";
    }

    public removeEventListener(x: any) {
        throw "NotSupportedByMock";
    }

    public dispatchEvent(x: any): boolean {
        throw "NotSupportedByMock";
    }
}
