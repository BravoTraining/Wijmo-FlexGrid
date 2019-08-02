import * as wjc from 'wijmo/wijmo';

export class PropertyChangedEventArgs extends wjc.EventArgs {
    public readonly zPropertyName: string;
    public readonly value: string;

    constructor(pzPropertyName: string, pValue: any) {
        super();
        this.zPropertyName = pzPropertyName;
        this.value = pValue;
    }
}