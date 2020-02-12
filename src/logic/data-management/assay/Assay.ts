import DataRepository from "../../data-source/DataRepository";
import Visitable from "../../patterns/visitor/Visitable";
import AssayVisitor from "./visitors/AssayVisitor";
import { StorageType } from "../StorageType";
import MPAConfig from "../MPAConfig";
import Entity from "./Entity";

export default abstract class Assay implements Visitable<AssayVisitor>, Entity<string> {
    private _id: string;
    private _name: string;
    private _date: Date;
    private _storageType: StorageType;

    protected _dataRepository: DataRepository;

    public progress: number = 0;

    constructor(id: string = undefined, storageType: StorageType = undefined, name: string = undefined, date: Date = undefined) {
        this._id = id;
        this._name = name;
        this._date = date;
        this._storageType = storageType;
    }

    getId() {
        return this._id;
    }

    setId(id: string) {
        this._id = id;
    }

    getName() {
        return this._name;
    }

    setName(name: string) {
        this._name = name;
    }

    getDate() {
        return this._date;
    }

    setDate(date: Date) {
        this._date = date;
    }

    getStorageType() {
        return this._storageType;
    }

    setStorageType(storageType: StorageType) {
        this._storageType = storageType;
    }

    get dataRepository() {
        return this._dataRepository;
    }

    getDateFormatted(): string {
        // @ts-ignore
        return this._date.getFullYear() + "/" + (this._date.getMonth() + 1).toString().padStart(2, "0") + "/" + this._date.getDate().toString().padStart(2, "0");
    }

    abstract async initDataRepository(mpaConfig: MPAConfig, baseUrl: string);
    abstract async accept(visitor: AssayVisitor): Promise<void>;
}