/**
 * Mock for threads-library that needs to be supported for testing to work. This is a very fragile implementation that
 * should never be used in production environments. It is only suitable for tests in this package. A side-effect of
 * this mock, is that the exposed function in a worker file needs to be exported!
 *
 * @author Pieter Verschaffelt
 */

export class Worker {
    public file: string;

    constructor(file) {
        this.file = file;
    }

    async getData(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const glob = require("glob");
            glob(__dirname + "/../../business/**/" + this.file.replace("./", ""), {}, (err, files) => {
                const data = require(files[0]);
                resolve(data);
            });
        });
    }
}

export async function spawn(worker: Worker): Promise<Function> {
    const data = await worker.getData();
    return data["default"];
}

export function expose(input: any): void {
    // This function does not need to do anything
}
