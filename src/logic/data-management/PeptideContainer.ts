import DatasetManager from './DatasetManager';
import {StorageType} from './StorageType';
import Sample from './Sample';
import ProgressListener from '../patterns/ProgressListener';

export default class PeptideContainer implements ProgressListener 
{
    public progress: number = 0;
    private id: string;
    private peptides: string[];
    private name: string;
    private peptideAmount: number;
    private date: Date;
    private type: StorageType;
    private dataset: Sample | null;

    /**
     * Create a new PeptideContainer. A PeptideContainer is actually a representation of a dataset that can be
     * serialized to local storage.
     *
     * @param id A unique id associated with this dataset.
     */
    constructor(id: string = undefined) {
        if (id === undefined) {
            id = this.generateUniqueId();
        }
        this.id = id;
        this.peptides = undefined;
    }

    /**
     * Read all current datasets properties (except all peptides) from local storage and load them in this container.
     */
    public async deserialize(type: StorageType): Promise<void> {
        this.type = type;
        const storage: Storage = this.getStorage();
        const serializedMetadata = storage.getItem(DatasetManager.MPA_METADATA_PREFIX + this.id);
        const parsedMeta = JSON.parse(serializedMetadata);
        this.name = parsedMeta.name;
        const splitDate = parsedMeta.date.split('/');
        this.date = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
        this.peptideAmount = parsedMeta.amount;
    }

    public async store(): Promise<void> {
        const storage = this.getStorage();
        storage.setItem(DatasetManager.MPA_METADATA_PREFIX + this.id, this.getMetadataJSON());

        if (this.peptides !== undefined) {
            storage.setItem(DatasetManager.MPA_PEPTIDE_PREFIX + this.id, this.getDataJSON());
        }
    }

    /**
     * Remove the dataset from the browser's storage. Note that the object is only removed from the storage type
     * that's currently set.
     */
    public async remove(): Promise<void> {
        const storage: Storage = this.getStorage();
        storage.removeItem(DatasetManager.MPA_METADATA_PREFIX + this.id);
        storage.removeItem(DatasetManager.MPA_PEPTIDE_PREFIX + this.id);
    }

    public onProgressUpdate(p: number) {
        this.progress = p;
    }

    public getId(): string {
        return this.id;
    }

    /**
     * @returns The peptides that are stored in this container.
     */
    public async getPeptides(): Promise<string[]> {
        return this.getPeptidesSync();
    }

    public getPeptidesSync(): string[] {
        if (this.peptides === undefined) {
            const peptidesSerialized = this.getStorage().getItem(DatasetManager.MPA_PEPTIDE_PREFIX + this.id);

            if (peptidesSerialized == null) {
                throw new Error('Peptides for dataset ' + this.id + ' are not available in browser\'s storage!');
            }

            const parsedPeptides = JSON.parse(peptidesSerialized);
            this.peptides = parsedPeptides.peptides;
        }

        return this.peptides;
    }

    /**
     * Update the list of peptides that belong to this dataset. Note that the amount of peptides that stored is also
     * directly updated by this function. There's no need to invoke {@link PeptideContainer#setAmountOfPeptides}
     * afterwards.
     *
     * @param peptides The list of peptides that forms the heart of this dataset.
     */
    public setPeptides(peptides: string[]) {
        this.peptides = peptides;
        this.peptideAmount = this.peptides.length;
    }

    public getAmountOfPeptides(): number {
        return this.peptideAmount;
    }

    /**
     * @param amount The amount of peptides that are to be stored in this container.
     */
    public setAmountOfPeptides(amount: number): void {
        this.peptideAmount = amount;
    }

    /**
     * @param name The name of the stored dataset.
     */
    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getDateFormatted(): string {
        // @ts-ignore
        return this.date.getFullYear() + '/' + (this.date.getMonth() + 1).toString().padStart(2, '0') + '/' + this.date.getDate().toString().padStart(2, '0');
    }

    /**
     * @param date The date at which the dataset was first created.
     */
    public setDate(date: Date): void {
        this.date = date;
    }

    public getType(): StorageType {
        return this.type;
    }

    /**
     * Change the type of storage in which this peptide container resides. Note that this function does not update the
     * information in the associated storage type right away, but only changes the internal notion of type. If you want
     * the storage to also be updated, call {@link PeptideContainer#store} after changing the type.
     *
     * @param type The storage type in which the peptide container should reside from now on.
     */
    public setType(type: StorageType): void {
        this.type = type;
    }

    public getDataset(): Sample {
        return this.dataset;
    }

    public setDataset(dataset: Sample | null): void {
        this.dataset = dataset;
    }

    private getMetadataJSON(): string {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            amount: this.peptideAmount,
            date: this.getDateFormatted(),
            type: this.type,
        });
    }

    private getDataJSON(): string {
        return JSON.stringify({
            peptides: this.peptides,
        });
    }

    /**
     * This function looks for the highest id that's been used so far in the storage and creates a new unique id by
     * incrementing the previous highest id by one.
     *
     * @returns A newly generated unique identifier that can be used for storing a dataset.
     */
    private generateUniqueId(): string {
        const counter = window.localStorage.getItem(DatasetManager.MPA_STORAGE_PREFIX + 'unique-id-counter');
        let counterValue = 0;
        if (counter) {
            counterValue = parseInt(counter) + 1;
        }
        window.localStorage.setItem(DatasetManager.MPA_STORAGE_PREFIX + 'unique-id-counter', counterValue.toString());
        return counter;
    }

    private getStorage(): Storage {
        if (this.type === StorageType.LocalStorage) {
            return window.localStorage;
        } else {
            return window.sessionStorage;
        }
    }
}
