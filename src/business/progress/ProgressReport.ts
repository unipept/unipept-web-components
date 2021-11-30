/**
 * Describes the different steps that were passed when performing a specific operation. Each step comes with its own
 * description and progress value.
 *
 * @author Pieter Verschaffelt
 */
export type ProgressReport = {
    // An array with a description for each of the steps that can be passed through.
    steps: string[],
    // Array that has the same length as the steps array. It should contain the start time (as milliseconds since epoch
    // for each of the steps in this report).
    startTimes: number[],
    // Array that has the same length as the steps array. It should contain the end time (as milliseconds since epoch
    // for each of the steps in this report).
    endTimes: number[],
    // Which step is currently being processed?
    currentStep: number,
    // What is the progress value that corresponds to the current step? Must be a value in [0, 100] or -1 to indicate
    // an indeterminate progress.
    currentValue: number,
    // How many seconds will it probably still take to finish the current step. Use -1 if no ETA is available.
    // (ETA = Estimated Time Remaining)
    eta: number
}
