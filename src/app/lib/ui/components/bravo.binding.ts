import * as wjc from "wijmo/wijmo";
import { WebTable, convertTypeCodeToDataType, DataColumnChangeEventArgs } from "../../core/core";
import { FormGroup, AbstractControl } from '@angular/forms';

export class BravoBinding {
    public readonly dataSource = null;
    public readonly propertyName: string = null;
    public readonly dataMember: string = null;
    public readonly formGroup: FormGroup = null;

    public readonly onValueChanged: wjc.Event = new wjc.Event();

    private get value(): any {
        if (!this.currentItem) return;
        return this.currentItem[this.dataMember];
    }

    public bIsBinding = true;

    private set value(val: any) {
        if (!this.bIsBinding || !this.currentItem || (this.dataSource instanceof WebTable && !this.dataSource.canCancelEdit))
            return;

        if (this.parseCheckState.hasHandlers && this.dataSource instanceof WebTable &&
            this.dataSource.columns.get(this.dataMember)) {
            let _type = wjc.DataType[convertTypeCodeToDataType(this.dataSource.columns.get(this.dataMember).dataType)];
            let _args = new ConvertEventArgs(val, _type.toLocaleLowerCase());
            this.parseCheckState.raise(this, _args);
            val = _args.value;
        }

        if (this.currentItem[this.dataMember] != val)
            this.currentItem[this.dataMember] = val;
    }

    private _currentItem = null;

    public get currentItem(): any {
        return this._currentItem;
    }

    public readonly control = null;
    public readonly bindingControl: AbstractControl = null

    readonly parseCheckState = new wjc.Event();

    constructor(pControl?: any, pzPropertyName?: string, dataSource?: any, pzDataMember?: string, pControlBinding?: AbstractControl) {
        this.control = pControl;
        this.propertyName = pzPropertyName;
        this.dataSource = dataSource;
        this.dataMember = pzDataMember;

        if (dataSource instanceof WebTable) {
            if (!dataSource.currentItem && dataSource.itemCount > 0)
                dataSource.moveCurrentToFirst();

            dataSource.editItem(dataSource.currentItem);
            this._currentItem = dataSource.currentItem;

            dataSource.columnChanged.addHandler((s, e: DataColumnChangeEventArgs) => {
                if (e == null || e.Col == null || e.Col.columnName != pzDataMember)
                    return;

                if (e.ProposedValue == this.value || this.bindingControl == null)
                    return;

                this.bindingControl.setValue(e.ProposedValue);
            })
        }
        else {
            this._currentItem = dataSource;
        }

        if (pControlBinding) {
            this.bindingControl = pControlBinding;

            pControlBinding.setValue(this.value);
            pControlBinding.valueChanges.subscribe(this.controlBinding_valueChanges.bind(this));
        }
    }

    private controlBinding_valueChanges(value) {
        if (this.value == value) return;

        this.bindingControl.setValue(value, { onlySelf: true, emitEvent: false });

        this.value = value;

        if (this.dataSource instanceof WebTable)
            this.dataSource.currentEditItem = this.currentItem;

        this.onValueChanged.raise(this, wjc.EventArgs.empty);
    }
}

export class BravoBindingSource {
    DataSource: any;

    private _form: any = null;

    public get form(): any {
        return this._form;
    }

    constructor(pOwnerForm: any, pDataSource?: any) {
        this._form = pOwnerForm;
        this.DataSource = pDataSource;
    }

    private _isBindingSuspended: boolean = true;

    public get isBindingSuspended(): boolean {
        return this._isBindingSuspended && this.DataSource == null;
    }

    public get binddings(): Array<BravoBinding> {
        if (!this.form || !this.form.formGroup) return;

        let _ctrls = new Array<BravoBinding>();
        let _bds = this.form.formGroup.controls;
        if (_bds instanceof Object) {
            for (let _zKey in _bds) {
                let _ctrl = _bds[_zKey];

                let _ctrlsManager = _ctrl["_controlManager"];
                if (_ctrlsManager instanceof Array) {
                    for (let _bsCtrl of _ctrlsManager)
                        if (_bsCtrl.dataBinding)
                            _ctrls.push(_bsCtrl.dataBinding);
                }
            }
        }

        return _ctrls;
    }

}

export class ConvertEventArgs extends wjc.EventArgs {
    private _value: any = null;

    public get value(): any {
        return this._value;
    }

    public set value(value: any) {
        this._value = value;
    }

    private _desiredType: any;

    public get DesiredType(): any {
        return this._desiredType;
    }

    constructor(value: any, desiredType: any) {
        super();
        this._value = value,
            this._desiredType = desiredType;
    }
}