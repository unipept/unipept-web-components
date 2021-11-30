/**
 * Describes the different steps that were passed when performing a specific operation. Each step comes with its own
 * description and progress value.
 *
 * @author Pieter Verschaffelt
 */
export declare type ProgressReport = {
    steps: string[];
    startTimes: number[];
    endTimes: number[];
    currentStep: number;
    currentValue: number;
    eta: number;
};
