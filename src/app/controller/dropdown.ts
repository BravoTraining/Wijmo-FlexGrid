import * as wjCore from 'wijmo/wijmo';
import * as wjInput from 'wijmo/wijmo.input';

export class DropDown extends wjInput.Menu {

    protected _itemsSource: wjCore.ObservableArray;

    public constructor(hostElement: HTMLElement, ...pItems: Array<any>) {
        super(hostElement);
        this.itemsSource = pItems;
    }

    get itemsSource() : any {
        return this._lbx.itemsSource;
    }

    set itemsSource(pItems: any) {
        console.log(pItems);
        if (this._itemsSource && this._itemsSource.length > 0) {
            this._itemsSource.forEach((_item, _i) => {
                if (_item.propertyChanged)
                    _item.propertyChanged.removeAllHandlers();
            });
            console.log("1");
        }

        if (pItems instanceof wjCore.ObservableArray) {
            this._itemsSource = pItems;
            console.log("2");
        }
        else {
            this._itemsSource = new wjCore.ObservableArray(...pItems);
            console.log(this._itemsSource);
            console.log("3");
        }

        if (this._lbx.itemsSource != this._itemsSource) {
            this._lbx.itemsSource = this._itemsSource;
            this.onItemsSourceChanged();
            console.log("4");
        }
        console.log(this._itemsSource);
        this._updateBtn();
    }


}