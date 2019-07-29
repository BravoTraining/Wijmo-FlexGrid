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
        if (this._itemsSource && this._itemsSource.length > 0) {
            this._itemsSource.forEach((_item, _i) => {
                if (_item.propertyChanged)
                    _item.propertyChanged.removeAllHandlers();
            });
        }

        if (pItems instanceof wjCore.ObservableArray) {
            this._itemsSource = pItems;
        }
        else {
            this._itemsSource = new wjCore.ObservableArray(...pItems);
        }

        if (this._lbx.itemsSource != this._itemsSource) {
            this._lbx.itemsSource = this._itemsSource;
            this.onItemsSourceChanged();
        }
        this._updateBtn();
    }


}