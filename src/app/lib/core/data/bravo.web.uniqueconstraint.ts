import { DataKey } from "./bravo.web.foreignkeyconstraint";
import { WebDataColumn } from "./bravo.web.datacolumn";

export class UniqueContraint{
    private key: DataKey;
    private bPrimaryKey: boolean;
    private constraintName: string;

    private _columnNames: string[];
    public get columnNames() : string[] {
        return this._columnNames;
    }
    
    constructor(name: string, column: WebDataColumn){

    }

    private create(constraintName: string, columns: WebDataColumn[]){
        this.key = new DataKey(columns, true);
        this.constraintName = constraintName;
    }
}