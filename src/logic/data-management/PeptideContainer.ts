export default class PeptideContainer
{
    private _peptides: string[];
    private _peptideAmount: number;

    constructor(peptides: string[] = []) 
    {
        this._peptides = peptides;
        this._peptideAmount = peptides.length
    }

    getPeptides(): string[]
    {
        return this._peptides;
    }

    setPeptides(peptides: string[])
    {
        this._peptides = peptides;
        this._peptideAmount = this._peptides.length;
    }

    getAmountOfPeptides(): number
    {
        return this._peptideAmount;
    }

    setAmountOfPeptides(amount: number)
    {
        this._peptideAmount = amount;
    }
}
