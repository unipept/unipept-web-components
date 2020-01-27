import flushPromises from "flush-promises";

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * This function waits a specified amount of time for promises to be fullfilled before returning.
 *  
 * @param ms How many ms should we wait before continueing test execution? 
 */
export async function waitForPromises(ms) {
    await sleep(ms);
    await flushPromises();
}
