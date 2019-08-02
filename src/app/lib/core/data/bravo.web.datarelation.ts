import { MessageContstants } from "../common/message.constants";
import { WebTable } from "./bravo.web.datatable";
import { WebDataColumn } from "./bravo.web.datacolumn";
import { ForeignKeyConstraint, DataKey } from "./bravo.web.foreignkeyconstraint";

export class WebRelationCollection {
    private readonly table: WebTable;
    private readonly relations: Array<WebRelation>;
    private bParentCollection: boolean;

    constructor(table: WebTable, bParentCollection: boolean) {
        if (table == null) {
            throw new Error();
        }

        this.table = table;
        this.relations = new Array<WebRelation>();
        this.bParentCollection = bParentCollection;
    }

    get List(): Array<WebRelation> {
        return this.relations;
    }

    get(key: any): WebRelation {
        if (Number.isNumber(key)) {
            if (key > 0 && key < this.relations.length) {
                return <WebRelation>this.relations[key];
            }
        }
        else if (typeof key == 'string') {
            let _num = this.internalIndexOf(key);
            if (_num == -2) {
                throw new Error();
            }

            if (_num >= 0) {
                return <WebRelation>this.List[_num];
            }

            return null;
        }
    }

    push(...relation: WebRelation[]): number {
        relation.forEach(rel => {
            this.addCache(rel);
        });

        return relation.length;
    }

    add(name: string, parentColumn: WebDataColumn[], childColumn: WebDataColumn[]) {
        let _dataRelation = new WebRelation(name, parentColumn, childColumn, true);
        _dataRelation.setChildKeyConstraint(new ForeignKeyConstraint(name, parentColumn, childColumn));

        if (!_dataRelation.childConstrainKey.canEnableConstraint()) {
            throw new Error(String.format(MessageContstants.DataConstraint_ParentValues))
        }

        _dataRelation.parentTable.childRelations.push(_dataRelation);
        _dataRelation.childTable.parentRelations.push(_dataRelation);

        return _dataRelation;
    }

    private addCache(relation: WebRelation) {
        this.relations.push(relation);
        return null;
    }

    private internalIndexOf(name: string) {
        let _num = -1;
        if (name && 0 < name.length) {
            let _count = this.List.length;
            for (let _i = 0; _i < _count; _i++) {
                let _dataRelation = this.List[_i];
                let _num2 = String.compare(name, _dataRelation.relationName);
                if (_num2 == 0) {
                    return _i;
                }

                if (_num2 == -1) {
                    _num = ((_num == -1) ? _i : -2);
                }
            }
        }

        return _num;
    }
}

export class WebRelation {
    private _relationName: string;
    private createConstraints: boolean;
    private _parentKey: DataKey;
    private _childKey: DataKey;
    private _childConstrainKey: ForeignKeyConstraint;

    get childKey(): DataKey {
        return this._childKey;
    }

    get parentColumns(): Array<WebDataColumn> {
        return this._parentKey.toArray();
    }

    get childColumns(): Array<WebDataColumn> {
        return this._childKey.toArray();
    }

    get parentTable(): WebTable {
        return this._parentKey.Table;
    }

    get childTable(): WebTable {
        return this._childKey.Table;
    }

    get relationName(): string {
        return this.relationName;
    }

    get childConstrainKey() {
        return this._childConstrainKey;
    }

    setChildKeyConstraint(value: ForeignKeyConstraint) {
        this._childConstrainKey = value;
    }

    constructor(relationName: string, parentColumns: Array<WebDataColumn>,
        childColumns: Array<WebDataColumn>, createConstraints: boolean) {
        this.create(relationName, parentColumns, childColumns, createConstraints);
    }

    private create(relationName: string, parentColumns: Array<WebDataColumn>,
        childColumns: Array<WebDataColumn>, createConstraints: boolean) {
        this._parentKey = new DataKey(parentColumns, true);
        this._childKey = new DataKey(childColumns, true);

        if (parentColumns.length != childColumns.length) {
            throw new Error();
        }

        this._relationName = !relationName ? '' : relationName;
        this.createConstraints = createConstraints;
    }
}