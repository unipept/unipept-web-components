import { createMessageEventListener } from "./GeneralWorkerExports";

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", createMessageEventListener(ctx));
