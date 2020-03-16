import DataRepository from "../../data-source/DataRepository";
import Visitable from "../../patterns/visitor/Visitable";
import AssayVisitor from "./AssayVisitor";
import { StorageType } from "../StorageType";
import MPAConfig from "../MPAConfig";
import Entity from "./Entity";
import ChangeListener from "./../ChangeListener";

export default abstract class Assay implements Visitable<AssayVisitor>, Entity<string> {
    protected readonly id: string;
    protected name: string;
    protected date: Date;
    protected changeListeners: ChangeListener<Assay>[];
    protected storageType: StorageType;

    protected _dataRepository: DataRepository;

    public progress: number = 0;

    constructor(changeListeners: ChangeListener<Assay>[], id: string, storageType?: StorageType, name?: string, date?: Date) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.changeListeners = changeListeners;
        this.storageType = storageType;
    }

    getId(): string {
        return this.id;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        const oldName: string = this.name;
        this.name = name;
        this.onUpdate("name", oldName, name);
    }

    getDate() {
        return this.date;
    }

    setDate(date: Date) {
        const oldDate: Date = date;
        this.date = date;
        this.onUpdate("date", oldDate, date);
    }

    getStorageType() {
        return this.storageType;
    }

    setStorageType(storageType: StorageType) {
        this.storageType = storageType;
    }

    get dataRepository() {
        return this._dataRepository;
    }

    getDateFormatted(): string {
        // @ts-ignore
        return this.date.getFullYear() + "/" + (this.date.getMonth() + 1).toString().padStart(2, "0") + "/" + this.date.getDate().toString().padStart(2, "0");
    }

    public reset(): void {
        this.progress = 0;
        this._dataRepository = undefined;
    }

    protected onUpdate(field: string, oldValue: any, newValue: any) {
        for (const changeListener of this.changeListeners) {
            changeListener.onChange(this, field, oldValue, newValue);
        }
    }

    abstract async initDataRepository(mpaConfig: MPAConfig, baseUrl: string);
    abstract async accept(visitor: AssayVisitor): Promise<void>;
}
