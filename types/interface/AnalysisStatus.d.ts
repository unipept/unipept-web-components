import { ProgressReport } from "./ProgressReport";
export interface AnalysisStatus {
    progress: ProgressReport;
    analysisInProgress: boolean;
    progressFilter: ProgressReport;
    filterInProgress: boolean;
    error: {
        status: boolean;
        message: string;
        object: Error | null;
    };
}
