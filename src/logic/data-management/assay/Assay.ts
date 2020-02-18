import DataRepository from "../../data-source/DataRepository";
import Visitable from "../../patterns/visitor/Visitable";
import AssayVisitor from "./AssayVisitor";
import { StorageType } from "../StorageType";
import MPAConfig from "../MPAConfig";
import Entity from "./Entity";
import ChangeListener from "./../ChangeListener";

export default abstract class Assay implements Visitable<AssayVisitor>, Entity<string> {
    protected id: string;
    protected name: string;
    protected date: Date;
    protected changeListener: ChangeListener<Assay>;
    protected storageType: StorageType;

    protected _dataRepository: DataRepository;

    public progress: number = 0;

    constructor(changeListener?: ChangeListener<Assay>, id?: string, storageType?: StorageType, name?: string, date?: Date) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.changeListener = changeListener;
        this.storageType = storageType;
    }

    getId(): string {
        return this.id;
    }

    setId(id: string) {
        const oldId: string = this.id;
        this.id = id;
        this.changeListener.onChange(this, "id", oldId, id);
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        const oldName: string = this.name;
        this.name = name;
        this.changeListener.onChange(this, "name", oldName, name);
    }

    getDate() {
        return this.date;
    }

    setDate(date: Date) {
        const oldDate: Date = date;
        this.date = date;
        this.changeListener.onChange(this, "date", oldDate, date);
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

    abstract async initDataRepository(mpaConfig: MPAConfig, baseUrl: string);
    abstract async accept(visitor: AssayVisitor): Promise<void>;
}
