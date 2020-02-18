import DataRepository from "../../data-source/DataRepository";
import Visitable from "../../patterns/visitor/Visitable";
import AssayVisitor from "src/logic/data-management/assay/AssayVisitor";
import { StorageType } from "../StorageType";
import MPAConfig from "../MPAConfig";
import Entity from "./Entity";
import ChangeListener from "@/logic/data-management/ChangeListener";

export default abstract class Assay implements Visitable<AssayVisitor>, Entity<string> {
    protected id: string;
    protected name: string;
    protected date: Date;
    protected changeListener: ChangeListener;
    protected storageType: StorageType;

    protected _dataRepository: DataRepository;

    public progress: number = 0;

    constructor(changeListener?: ChangeListener, id?: string, storageType?: StorageType, name?: string, date?: Date) {
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
        this.id = id;
        this.changeListener.onChange("id");
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
        this.changeListener.onChange("name");
    }

    getDate() {
        return this.date;
    }

    setDate(date: Date) {
        this.date = date;
        this.changeListener.onChange("date");
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
