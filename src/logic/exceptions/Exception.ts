export default class Exception extends Error {
    public readonly message: string;
    public readonly cause!: Error;

    constructor(message = "", cause?: Error) {
        super(message);
        this.message = message;
        if(cause) {
            this.cause = cause;
        }
    }
}
