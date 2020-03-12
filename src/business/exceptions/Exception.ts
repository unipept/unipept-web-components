export default class Exception extends Error {
    public readonly message: string;
    public readonly cause: Error;

    constructor(message: string = "", cause?: Error) {
        super(message);
        this.message = message;
        this.cause = cause;
    }
}
