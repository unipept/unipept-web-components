import { ProgressReport } from "@/interface";

export default class ProgressUtils {
    public static constructProgressObject(steps: string[]): ProgressReport {
        return {
            currentValue: -1,
            currentStep: 0,
            eta: 0,
            steps: steps.map((step) => {
                return {
                    description: step,
                    start: 0,
                    end: 0
                };
            }),
            logs: []
        };
    }
};
