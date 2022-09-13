export declare const workerFunctionMap: Map<string, (any: any) => Promise<any>>;
export declare function createMessageEventListener(ctx: Worker): (event: MessageEvent) => Promise<void>;
