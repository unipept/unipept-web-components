export default class Exception extends Error {
    readonly message: string;
    readonly cause: Error;
    constructor(message?: string, cause?: Error);
}
