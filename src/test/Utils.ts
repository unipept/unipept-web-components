import flushPromises from "flush-promises";
import Vue from "vue";
import { CombinedVueInstance } from "vue/types/vue";
import { Wrapper } from "@vue/test-utils";

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

/**
 * This function returns only when the given condition evaluates to true, or when the given timeout has been exceeded.
 *
 * @param condition 
 * @param timeout 
 * @param interval 
 */
export async function waitForCondition(condition: () => boolean, timeout = 1000, interval = 100) {
    let totalSleep = 0;
    while (!condition() && totalSleep <= timeout) {
        await waitForPromises(interval);
        totalSleep += interval;
    }
}

/**
 * This function returns only after a specified element is present, or the given timeout has been
 * exceeded.
 * 
 * @param wrapper The Vue wrapper in which the given selector should be found.
 * @param selector The selector for which should be looked.
 * @param timeout The maximum amount of time this function waits before returning.
 * @param interval The time between successive lookups.
 */
export async function waitForElement(
    wrapper:  Wrapper<CombinedVueInstance<Vue, object, object, object, Record<never, any>>>, 
    selector, 
    timeout = 1000, 
    interval = 100
) {
    await waitForCondition(() => wrapper.find(selector).exists(), timeout, interval);
}
