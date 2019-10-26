import DataRepository from "../../data-source/DataRepository";
import Visitable from "../../patterns/visitor/Visitable";
import Visitor from "../../patterns/visitor/Visitor";
import { StorageType } from "../StorageType";
import { AssayState } from './AssayState';
import MPAConfig from "../MPAConfig";

export default abstract class Assay implements Visitable {
    private _id: string;
    private _name: string;
    private _date: Date;
    private _storageType: StorageType;

    protected _state: AssayState = AssayState.Uninitialized;
    protected _rejectCause: Error;
    protected _progress: number = 0;

    protected _dataRepository: DataRepository;

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

    get state() {
        return this._state;
    }

    get rejectCause() {
        return this._rejectCause;
    }

    get progress() {
        return this._progress;
    }

    getDateFormatted(): string {
        // @ts-ignore
        return this._date.getFullYear() + "/" + (this._date.getMonth() + 1).toString().padStart(2, "0") + "/" + this._date.getDate().toString().padStart(2, "0");
    }

    abstract async initialize(mpaConfig: MPAConfig);
    abstract async visit(visitor: Visitor): Promise<void>;
}