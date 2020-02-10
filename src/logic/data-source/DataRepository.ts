import TaxaDataSource from "./TaxaDataSource";
import GoDataSource from "./GoDataSource";
import EcDataSource from "./EcDataSource";
import InterproDataSource from "./InterproDataSource";

export default abstract class DataRepository {
    protected _taxaSourceCache: TaxaDataSource;
    protected _goSourceCache: GoDataSource;
    protected _ecSourceCache: EcDataSource;
    protected _interproSourceCache: InterproDataSource;

    public async createTaxaDataSource(): Promise<TaxaDataSource> {
        if (!this._taxaSourceCache) {
            await this.initTaxaDataSource();
        }
        return this._taxaSourceCache;
    }

    public async createGoDataSource(): Promise<GoDataSource> {
        if (!this._goSourceCache) {
            await this.initGoDataSource();
        }
        return this._goSourceCache;
    }

    public async createEcDataSource(): Promise<EcDataSource> {
        if (!this._ecSourceCache) {
            await this.initEcDataSource();
        }
        return this._ecSourceCache;
    }

    public async createInterproDataSource(): Promise<InterproDataSource> {
        if (!this._interproSourceCache) {
            await this.initInterproDataSource();
        }
        return this._interproSourceCache;
    }

    protected abstract async initTaxaDataSource(): Promise<void>;
    protected abstract async initGoDataSource(): Promise<void>;
    protected abstract async initEcDataSource(): Promise<void>;
    protected abstract async initInterproDataSource(): Promise<void>;
}
