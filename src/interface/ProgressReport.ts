export interface Step {
    description: string
    start: number
    end: number
}

export interface ProgressReport {
    steps: Step[]
    currentStep: number
    currentValue: number
    eta: number
    logs: string[]
}
