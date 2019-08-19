import PeptideContainer from './PeptideContainer';
import {StorageType} from './StorageType';
import {get, getJSON} from '../utils.js';

export default class DatasetManager {
    public static readonly MPA_STORAGE_PREFIX: string = 'mpa-';
    public static readonly MPA_METADATA_PREFIX: string = DatasetManager.MPA_STORAGE_PREFIX + 'metadata-';
    public static readonly MPA_PEPTIDE_PREFIX: string = DatasetManager.MPA_STORAGE_PREFIX + 'peptide-';

    public datasets: PeptideContainer[] = [];
    public selectedDatasets: PeptideContainer[] = [];

    private storageTypes: StorageType[] = [StorageType.LocalStorage, StorageType.SessionStorage];

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return A list containing all datasets stored in this manager's corresponding storage type and sorted
     *         alphabetically by name.
     */
    public async listDatasets(): Promise<PeptideContainer[]> {
        const output: PeptideContainer[] = [];
        const storage = this.getStorage(StorageType.LocalStorage);
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key != null && key.startsWith(DatasetManager.MPA_METADATA_PREFIX)) {
                const dataset = new PeptideContainer(key.substr(DatasetManager.MPA_METADATA_PREFIX.length));
                await dataset.deserialize(StorageType.LocalStorage);
                output.push(dataset);
            }
        }

        return output.sort((a, b) =>  a.getName() < b.getName() ? -1 : 1);
    }

    /**
     * Returns a dataset that was fetched from the Pride-archive.
     *
     * @param id The Pride-assay id that's associated with the requested dataset.
     * @param progressCallback Callback that's invoked with new progress when available.
     * @return A list of peptides associated with the given pride assay.
     */
    public async loadPrideDataset(
        id: number,
        progressCallback: (p: number) => void = (n: number) => {},
    ): Promise<string[]> {
        progressCallback(0);

        const batchSize: number = 1000;
        let peptides: string[] = [];

        const datasetSize: number = await get('https://www.ebi.ac.uk/pride/ws/archive/peptide/count/assay/' + id);
        const urls: string[] = [];
        let page: number;


        for (page = 0; page * batchSize < datasetSize; page++) {
            urls.push('https://www.ebi.ac.uk/pride/ws/archive/peptide/list/assay/' + id + '?show=' + batchSize + '&page=' + page);
        }

        page = 0;
        await urls.map(getJSON).reduce(
            (sequence: Promise<void>, batchPromise) => {
                return sequence.then(() => {
                    return batchPromise;
                }).then((response: any) => {
                    page++;

                    progressCallback((10 + (90 * page * batchSize) / datasetSize) / 100);
                    peptides = peptides.concat(response.list.map((d: any) => {
                        return d.sequence;
                    }));
                });
            }, Promise.resolve(),
        );

        return peptides;
    }

    /**
     * Removes all datasets from the browser's storage.
     */
    public async clearStorage(): Promise<void> {
        for (const storageType of this.storageTypes) {
            const storage = this.getStorage(storageType);
            const toRemove = [];

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key != null && key.startsWith(DatasetManager.MPA_STORAGE_PREFIX)) {
                    toRemove.push(key);
                }
            }

            for (const key of toRemove) {
                storage.removeItem(key);
            }
        }
    }

    public async deleteDatasetFromStorage(dataSet: PeptideContainer): Promise<void> {
        const storage: Storage = this.getStorage(dataSet.getType());
        storage.removeItem(DatasetManager.MPA_PEPTIDE_PREFIX + dataSet.getId());
        storage.removeItem(DatasetManager.MPA_METADATA_PREFIX + dataSet.getId());
    }

    private getStorage(storageType: StorageType): Storage {
        if (storageType === StorageType.LocalStorage) {
            return window.localStorage;
        } else {
            return window.sessionStorage;
        }
    }
}
