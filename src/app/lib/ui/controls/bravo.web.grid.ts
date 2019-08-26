import { Component, forwardRef, Inject, ElementRef, Injector, SkipSelf, Optional, ChangeDetectorRef } from "@angular/core";
import { WjFlexGrid, wjFlexGridMeta } from "wijmo/wijmo.angular2.grid";
import { CellEditEndingEventArgs, GridPanel } from "wijmo/wijmo.grid";
import { Subject } from "rxjs";
import * as wjc from 'wijmo/wijmo';
import * as wjg from 'wijmo/wijmo.grid';
import {
    AggregateEnum, SortOrder, Dictionary, Event, EventArgs, ExtensionsMethod, WebTable, BravoCore,
    WebDataRow, BravoDataTypeConverter, BravoExpressionEvaluator, INVALID_VALUE, TypeCode, MouseButtons, asEnum, Image
} from "../../core/core";
import { MessageResources } from "../resources/message.resources";
import {
    CellStyleEnum, GridAutoTextContentEnum, GridDataCellEnum, GridAutoFitRowHeightEnum,
    RowHeaderNumberingEnum, ScrollBars, StyleElementFlags, BarCodeTypeEnum, GridCellTypeEnum, GridCountGroupChildEnum,
    Border3DSide, GridBuiltInContextMenuEnum, SubtotalPositionEnum, RestrictedColumnEnum
} from "../enums";

import { IBravoControlBase } from "../interface/IBravoControlBase";
import { BravoNumericScale, NumericScaleUnitEnum } from "../../ui/bravo.numeric.scale";
import { takeUntil } from 'rxjs/operators';
import { BravoContextMenu } from './bravo.web.contextMenu';
import { Font } from '../font';
import { ToolStrip } from '../toolstrip/toolstrip';
import { Spliter, ItemDropDownEventArgs } from '../../../controller/dropdown';
import { DropDownToolStrip } from '../toolstrip/dropdown.toolstrip';
import { BravoResourceManager } from '../bravo.resource.manager';
// import { BravoBarCode } from './bravo.barcode';
import { IBravoBarCode } from '../interface/IBravoBarCode';
import { BravoSettings } from '../bravo.settings';
import { Enum } from '../components/bravo.decorator';
import { GridCellInfo } from '../dto/grid.cell.info';
import { getCellType, pxToPt } from '../bravo.ui.extensions';
import { BravoGraphicsRenderer } from '../bravo.graphics.renderer';

const NoDisplayPermissionContent: string = "●●●";
const COLUMN_NAME_PATTERN_FORMAT = "(?:\\b){0}(?:\\b)";
const DESC_SORT_COLUMN_NAME_PATTERN_FORMAT = "(?:\\b){0}\\s+DESC(?:\\b)";
const StyleProp: string = "Style";
export const GridMergeStyleElement = "Merge";
const GridStyleElementPatternFormat = "(?:\\b)(?<name>{0})(?:\\s*):(?:\\s*)(?<value>[^;]*);";
const GroupInColumnStyle = "GroupInColumnStyle";
const CellPadding = 1;

declare var Stimulsoft: any;

@Component({
    selector: 'bravo-web-grid',
    styleUrls: ['./bravo.web.grid.css'],
    template: '',
    inputs: [...wjFlexGridMeta.inputs, 'name'],
    outputs: wjFlexGridMeta.outputs,
    providers: [
        { provide: "WjComponent", useExisting: forwardRef(() => BravoWebGrid) }, ...wjFlexGridMeta.providers
    ]
})
export class BravoWebGrid extends WjFlexGrid implements IBravoControlBase {
    public static readonly BRC_PREFIX_CLASS = "bravo-";
    public static readonly AllColumnValue: string = '*';

    protected static CollapseMenuItem = "CollapseMenuItem";
    protected static ExpandMenuItem = "ExpandMenuItem";
    protected static AddRowColMenuItem = "AddRowColMenuItem";
    protected static DeleteRowColMenuItem = "DeleteRowColMenuItem";
    protected static InsertRowColMenuItem = "InsertRowColMenuItem";
    protected static GroupColumnMenuItem = "GroupColumnMenuItem";
    protected static SumColumnMenuItem = "SumColumnMenuItem";
    protected static GrandTotalMenuItem = "GrandTotalMenuItem";
    protected static HideGrandTotalMenuItem = "HideGrandTotalMenuItem";
    protected static TopGrandTotalMenuItem = "TopGrandTotalMenuItem";
    protected static BottomGrandTotalMenuItem = "BottomGrandTotalMenuItem";
    protected static CombinedGroupColumnMenuItem = "CombinedGroupColumnMenuItem";
    protected static ClearGroupColumnMenuItem = "ClearGroupColumnMenuItem";
    protected static SortAscendingMenuItem = "SortAscendingMenuItem";
    protected static SortDescendingMenuItem = "SortDescendingMenuItem";
    protected static CombineSortColumnMenuItem = "CombineSortColumnMenuItem";
    protected static ClearSortColumnMenuItem = "ClearSortColumnMenuItem";
    protected static FitSizeMenuItem = "FitSizeMenuItem";
    protected static DefaultSizeMenuItem = "DefaultSizeMenuItem";
    protected static FreezeMenuItem = "FreezeMenuItem";
    protected static GroupInColumnSettingMenuItem = "GroupInColumnSettingMenuItem";
    protected static DataTreeMenuItem = "DataTreeMenuItem";

    private _nContextCol = -1;
    private _nContextRow = -1;

    //#region static method

    public static getCellType(style: CellStyle): GridCellTypeEnum {
        if (style == null || String.isNullOrEmpty(style["Format"]))
            return GridCellTypeEnum.Normal;

        let _zFormat = style["Format"];

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.img]) == 0)
            return GridCellTypeEnum.img;

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.rtf]) == 0)
            return GridCellTypeEnum.rtf;

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.html]) == 0)
            return GridCellTypeEnum.html;

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.barcode]) == 0)
            return GridCellTypeEnum.barcode;

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.qrcode]) == 0)
            return GridCellTypeEnum.qrcode;

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.progress]) == 0)
            return GridCellTypeEnum.progress;

        if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.link]) == 0)
            return GridCellTypeEnum.link;

        return GridCellTypeEnum.Normal;
    }

    public static getCellRangeStyle(pPanel: GridPanel, pnTopRow: number, pnLeftCol: number,
        pnBottomRow: number, pnRightCol: number) {
        if (pnTopRow > pnBottomRow || pnLeftCol > pnRightCol) return;

        if (pnTopRow == pnBottomRow && pnLeftCol == pnRightCol)
            return BravoWebGrid.getCellStyle(pPanel, pnTopRow, pnLeftCol, false);

        let _cs = new CellStyle();
        for (let _nRow = pnTopRow; _nRow <= pnBottomRow; _nRow++) {
            for (let _nCol = pnLeftCol; _nCol <= pnRightCol; _nCol++) {
                let _col = pPanel.columns[_nCol],
                    _row = pPanel.columns[_nRow];

                if (_nRow == pnTopRow)
                    _cs.mergeWith(_col[StyleProp]);

                if (_row && _row[StyleProp]) {
                    let _zStyle = _row[StyleProp][_col.binding];
                    let _cs1 = CellStyle.parseString(_zStyle);
                    _cs.mergeWith(_cs1);
                }
            }
        }

        return _cs;
    }

    public static getCellStyle(pPanel: GridPanel, pnRow: number, pnCol: number, pbSingleCell: boolean = true): CellStyle {
        if (!isCellValid(pPanel, pnRow, pnCol)) return new CellStyle();

        let _grid = <BravoWebGrid>pPanel.grid,
            _row: wjg.Row = pPanel.rows[pnRow],
            _col: wjg.Column = pPanel.columns[pnCol],
            _cs = new CellStyle();

        if (!pbSingleCell) {
            switch (pPanel.cellType) {
                case wjg.CellType.ColumnHeader:
                    _cs.mergeWith(_grid.styles.getValue(CellStyleEnum.Fixed));
                    break;
                case wjg.CellType.Cell:
                    _cs.mergeWith(_grid.styles.getValue(CellStyleEnum.Normal));

                    if (_row instanceof wjg.GroupRow) {
                        let _cellStyleKey = String.format('Subtotal{0}', _row.level);
                        _cs.mergeWith(_grid.styles.getValue(CellStyleEnum[_cellStyleKey]));
                    }

                    break;
            }

            if (pPanel.cellType == wjg.CellType.Cell) {
                if (_col && _col[StyleProp]) {
                    let _cs0 = _col[StyleProp];
                    _cs.mergeWith(_cs0);
                }
            }
        }

        let _binding = pPanel.columns[pnCol].binding;

        if (_row && _row[StyleProp]) {
            let _zStyle: string = _row[StyleProp][_binding],
                _cs1 = CellStyle.parseString(_zStyle);

            _cs.mergeWith(_cs1);
        }

        return _cs;
    }

    //#endregion static method

    //#region custom properties

    public get allowEditing(): boolean {
        return !this.isReadOnly;
    }

    /**
     * Gets or sets whether the user is allowed to edit grid contents.
     */
    public set allowEditing(value: boolean) {
        this.isReadOnly = !value;
    }

    private _autoFitRowHeight: GridAutoFitRowHeightEnum = GridAutoFitRowHeightEnum.None;

    /**
     * Auto fit height of rows to their contents when they are drawn.
     */
    @Enum(GridAutoFitRowHeightEnum)
    public get autoFitRowHeight(): GridAutoFitRowHeightEnum {
        return this._autoFitRowHeight;
    }

    public set autoFitRowHeight(value: GridAutoFitRowHeightEnum) {
        this._autoFitRowHeight = value;
    }

    private _autoTextMode: GridAutoTextContentEnum = GridAutoTextContentEnum.Fixed;

    /**
     * Indicate which cell content will be translated autotext automatically.
     */
    @Enum(GridAutoTextContentEnum)
    public get autoTextMode(): GridAutoTextContentEnum {
        return this._autoTextMode;
    }

    public set autoTextMode(value: GridAutoTextContentEnum) {
        this._autoTextMode = value;
    }

    private _allowBuiltInContextMenu = GridBuiltInContextMenuEnum.Automatic;

    /**
     * Allow showing builtin context menu when user clicks right mouse button on some special areas in grid.
     */
    @Enum(GridBuiltInContextMenuEnum)
    public get allowBuiltInContextMenu(): GridBuiltInContextMenuEnum {
        return this._allowBuiltInContextMenu;
    }

    public set allowBuiltInContextMenu(value: GridBuiltInContextMenuEnum) {
        value = asEnum(value, GridBuiltInContextMenuEnum);
        if (this._allowBuiltInContextMenu != value)
            this._allowBuiltInContextMenu = value;
    }

    /**
     * Handle Enter key in editing mode to auto find and move to next editable cell when finish editing at current cell.
     */
    public get bHandleEnterKeyEdit(): boolean {
        return this.keyActionEnter == wjg.KeyAction.CycleOut;
    }

    public set bHandleEnterKeyEdit(value: boolean) {
        if (this.keyActionEnter == wjg.KeyAction.CycleOut)
            return;

        this.keyActionEnter = value ? wjg.KeyAction.CycleOut : wjg.KeyAction.None;
    }

    public _bAllowGrandTotal: boolean = false;

    /** 
     * Allow grand total row is display by sum numeric columns. 
     */
    public get bAllowGrandTotal(): boolean {
        return this._bAllowGrandTotal;
    }

    public set bAllowGrandTotal(value: boolean) {
        this._bAllowGrandTotal = value;
    }

    private _bAllowAddingColumn: boolean = false;

    /**
     *  Allow column can be added or inserted by user. 
     */
    public get bAllowAddingColumn(): boolean {
        return this._bAllowAddingColumn;
    }

    public set bAllowAddingColumn(value: boolean) {
        this._bAllowAddingColumn = value;
    }

    private _bAllowDeletingColumn: boolean = false;

    /** 
     * Allow column can be deleted by user. 
     */
    public get bAllowDeletingColumn(): boolean {
        return this._bAllowDeletingColumn;
    }

    public set bAllowDeletingColumn(value: boolean) {
        this._bAllowDeletingColumn = value;
    }

    private _bAllowGrouping: boolean = true;

    /** 
     * Allow user to group data. 
     */
    public get bAllowGrouping(): boolean {
        return this._bAllowGrouping;
    }

    public set bAllowGrouping(value: boolean) {
        this._bAllowGrouping = value;
    }

    /**
     * Allow user to sort data at indicated column.
     */
    public get bAllowSorting(): boolean {
        return this.allowSorting;
    }

    public set bAllowSorting(value: boolean) {
        this.allowSorting = value;
    }

    private _bAllowRaisingUpdateGroupsEvents = false;

    /**
     * Determine whether onBeforeUpdateGroups/onAfterUpdateGroups events will be raised or not.
     */
    public get bAllowRaisingUpdateGroupsEvents(): boolean {
        return this._bAllowRaisingUpdateGroupsEvents;
    }

    public set bAllowRaisingUpdateGroupsEvents(val: boolean) {
        this._bAllowRaisingUpdateGroupsEvents = val;
    }

    private _bMarkDataRowState: boolean = false;

    /**
     * Color mark row header for error and changed data rows.
     */
    public get bMarkDataRowState(): boolean {
        return this._bMarkDataRowState;
    }

    public set bMarkDataRowState(value: boolean) {
        this._bAllowAddingColumn = value;
    }

    private _bManualSumForGroup: boolean = false;

    /**
     * Indicate manual handle sum total for subtotal nodes.
     */
    public get bManualSumForGroup(): boolean {
        return this._bManualSumForGroup;
    }

    public set bManualSumForGroup(value: boolean) {
        this._bManualSumForGroup = value;
    }

    private _bGroupInColumn = false;

    /**
     * Indicate grouping data by merging row at specified column.
     */
    public get bGroupInColumn(): boolean {
        return this._bGroupInColumn;
    }

    public set bGroupInColumn(value: boolean) {
        if (this._bGroupInColumn == value) return;
        this._bGroupInColumn = value;
    }

    protected _bDrawContentBorders: boolean = false;

    public get bDrawContentBorders(): boolean {
        return this._bDrawContentBorders;
    }

    public set bDrawContentBorders(value: boolean) {
        if (this._bDrawContentBorders == value) return;
        this._bDrawContentBorders = value;
        this.invalidate();
    }

    private _bContentBorderForColumnHeaders: boolean = true;

    /**
     * Use if bDrawContentBorders=True indicates content includes column headers.
     */
    public get bContentBordersForColumnHeaders(): boolean {
        return this._bContentBorderForColumnHeaders;
    }

    public set bContentBordersForColumnHeaders(value: boolean) {
        if (this._bContentBorderForColumnHeaders == value) return;
        this._bContentBorderForColumnHeaders = value;
    }

    private _bCreateTreeNodeAsSubtotal: boolean = true;

    /**
     * Apply subtotal style for created tree node and not binding to data source.
     */
    public get bCreateTreeNodeAsSubtotal(): boolean {
        return this._bCreateTreeNodeAsSubtotal;
    }

    public set bCreateTreeNodeAsSubtotal(value: boolean) {
        this._bCreateTreeNodeAsSubtotal = value;
    }

    private _bHeaderNumberingAutoSize: boolean = false;

    /**
     * Auto fit column width to header numbering content.
     */
    public get bHeaderNumberingAutoSize(): boolean {
        return this._bHeaderNumberingAutoSize;
    }

    public set bHeaderNumberingAutoSize(value: boolean) {
        this._bHeaderNumberingAutoSize = value;
    }

    private _contentBorderColor: wjc.Color = wjc.Color.fromString('#333'); //wjc.Color.fromString('#d4d4d4');

    public get contentBorderColor(): wjc.Color {
        return this._contentBorderColor;
    }

    public set contentBorderColor(value: wjc.Color) {
        if (this._contentBorderColor.equals(value)) return;
        this._contentBorderColor = value;
        if (this.bDrawContentBorders) this.invalidate();
    }

    /**
     * Determine whether total childs is displayed at group nodes or not.
     */

    private _countGroupChilds = GridCountGroupChildEnum.Hide;

    @Enum(GridCountGroupChildEnum)
    public get countGroupChilds(): GridCountGroupChildEnum {
        return this._countGroupChilds;
    }

    public set countGroupChilds(value: GridCountGroupChildEnum) {
        if (this._countGroupChilds != value)
            this._countGroupChilds = value;
    }

    private _expressionEvaluator: BravoExpressionEvaluator = null;

    public get expressionEvaluator(): BravoExpressionEvaluator {
        if (!this._expressionEvaluator)
            this._expressionEvaluator = new BravoExpressionEvaluator();

        return this._expressionEvaluator;
    }

    public set expressionEvaluator(value: BravoExpressionEvaluator) {
        this._expressionEvaluator = value;
    }

    private _groups: Dictionary<string, GroupColumnItem> = null;

    public get groups(): Dictionary<string, GroupColumnItem> {
        if (this._groups == null)
            this._groups = new Dictionary<string, GroupColumnItem>();

        return this._groups;
    }

    private _hideZeroValue: GridDataCellEnum = GridDataCellEnum.Bound;

    @Enum(GridDataCellEnum)
    public get hideZeroValue(): GridDataCellEnum {
        return this._hideZeroValue;
    }

    public set hideZeroValue(value: GridDataCellEnum) {
        this._hideZeroValue = value;
    }

    private _nTreeColumnPos: number = -1;

    public get nTreeColumnPos(): number {
        if (this._nTreeColumnPos == -1 && this.zTreeColName)
            this._nTreeColumnPos = this.columns.indexOf(this.zTreeColName) || 0;

        return this._nTreeColumnPos;
    }

    /**
     * Indicate number of columns is frozen.
     */
    public get nFreezeCols(): number {
        return this.frozenColumns;
    }

    public set nFreezeCols(value: number) {
        this.frozenColumns = value;
    }

    /**
     * Indicate number of rows is frozen.
     */
    public get nFreezeRows(): number {
        return this.frozenRows;
    }

    public set nFreezeRows(value: number) {
        this.frozenRows = value;
    }

    private _nHeaderNumberingCol: number = -1;

    public get nHeaderNumberingCol(): number {
        return this._nHeaderNumberingCol;
    }

    public set nHeaderNumberingCol(value: number) {
        this._nHeaderNumberingCol = value;
    }

    private _sumColumns: Dictionary<string, string> = null;

    public get sumColumns(): Dictionary<string, string> {
        if (!this._sumColumns) {
            this._sumColumns = new Dictionary();
            this._sumColumns.add(BravoWebGrid.AllColumnValue, null);
        }

        return this._sumColumns;
    }

    private _zTreeColName: string = null;

    public get zTreeColName(): string {
        return this._zTreeColName;
    }

    public set zTreeColName(val: string) {
        this._zTreeColName = val;
    }

    private _zMakingTreeNodeKeyColName: string = null;

    public get zMakingTreeNodeKeyColName(): string {
        return this._zMakingTreeNodeKeyColName;
    }

    public set zMakingTreeNodeKeyColName(val: string) {
        this._zMakingTreeNodeKeyColName = val;

        if (!String.isNullOrEmpty(this._zMakingTreeNodeKeyColName))
            this.treeIndent = 0;
    }

    private _zDataViewSortExprFormat = '{0}';

    public get zDataViewSortExprFormat(): string {
        return this._zDataViewSortExprFormat;
    }

    public set zDataViewSortExprFormat(val: string) {
        this._zDataViewSortExprFormat = val;
    }

    private _restrictedColumns: Dictionary<string, RestrictedColumnEnum> = null;

    public get restrictedColumns(): Dictionary<string, RestrictedColumnEnum> {
        if (!this._restrictedColumns)
            this._restrictedColumns = new Dictionary<string, RestrictedColumnEnum>();

        return this._restrictedColumns;
    }

    private _rowHeaderNumbering: RowHeaderNumberingEnum = RowHeaderNumberingEnum.None;

    @Enum(RowHeaderNumberingEnum)
    public get rowHeaderNumbering(): RowHeaderNumberingEnum {
        return this._rowHeaderNumbering;
    }

    public set rowHeaderNumbering(value: RowHeaderNumberingEnum) {
        this._rowHeaderNumbering = value;
    }

    private _rowLayout: Array<any> = null;

    public get rowLayout(): Array<any> {
        if (this._rowLayout == null)
            this._rowLayout = new Array();

        return this._rowLayout;
    }

    private _dynamicStyles: Array<DynamicStyleItem> = null;

    public get dynamicStyles(): Array<DynamicStyleItem> {
        if (!this._dynamicStyles)
            this._dynamicStyles = new Array<DynamicStyleItem>();

        return this._dynamicStyles;
    }

    private _styles: Dictionary<CellStyleEnum, CellStyle> = null;

    public get styles(): Dictionary<CellStyleEnum, CellStyle> {
        if (!this._styles)
            this._styles = new Dictionary<CellStyleEnum, CellStyle>();

        return this._styles;
    }

    private _font: Font = null;

    public get font(): Font {
        return this._font;
    }

    private _name: string = '';

    public get name(): string {
        return this._name;
    }

    public set name(val: string) {
        this._name = val;
    }

    public get visible(): boolean {
        return this.hostElement && this.hostElement.style.display == 'none' ? false : true;
    }

    public set visible(val: boolean) {
        if (!this.hostElement) return;

        this.hostElement.style.display = val ? 'block' : 'none';
    }

    public get height(): number {
        return this.hostElement ? this.hostElement.offsetHeight : 0;
    }

    public set height(value: number) {
        if (!this.hostElement) return;
        if (value != this.height) this.hostElement.style.height = `${value}px`;
    }

    public get width(): number {
        return this.hostElement ?
            this.hostElement.offsetWidth + 1 : 0;
    }

    public set width(value: number) {
        if (!this.hostElement) return;
        if (value != this.width) this.hostElement.style.width = value + 'px';
    }

    public get top(): number {
        return this.hostElement ? this.hostElement.offsetTop : 0;
    }

    public get bottom(): number {
        return this.hostElement ? this.hostElement.offsetTop + this.hostElement.offsetHeight : 0;
    }

    public get left(): number {
        return this.hostElement ? this.hostElement.offsetLeft : 0;
    }

    public get right(): number {
        return this.hostElement ? this.hostElement.offsetLeft + this.hostElement.offsetWidth : 0;
    }

    private _scrollBars: ScrollBars = ScrollBars.Both;

    public get scrollBars(): ScrollBars {
        return this._scrollBars;
    }

    public set scrollBars(value: ScrollBars) {
        this._scrollBars = value;

        if (this._root) {
            switch (this._scrollBars) {
                case ScrollBars.None:
                    this._root.style.overflow = "hidden";
                    break;
                case ScrollBars.Horizontal:
                    this._root.style.overflowX = "auto";
                    this._root.style.overflowY = "hidden";
                    break;
                case ScrollBars.Vertical:
                    this._root.style.overflowX = "hidden";
                    this._root.style.overflowY = "auto";
                    break;
                case ScrollBars.Both:
                    this._root.style.overflow = "auto";
                    break;
            }
        }
    }

    public get enabled(): boolean {
        return !this.isDisabled;
    }

    public set enabled(value: boolean) {
        if (this.isDisabled == !value)
            return;

        this.isDisabled = !value;
    }

    private _text: string;

    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        this._text = value;
    }

    private _nNumericScale: number = 1;

    public get nNumericScale(): number {
        return this._nNumericScale;
    }

    public set nNumericScale(value: number) {
        this._nNumericScale = value;
    }

    private _numericScaleUnit: NumericScaleUnitEnum = NumericScaleUnitEnum.None;

    @Enum(NumericScaleUnitEnum)
    public get numericScaleUnit(): NumericScaleUnitEnum {
        return this._numericScaleUnit;
    }

    public set numericScaleUnit(value: NumericScaleUnitEnum) {
        this._numericScaleUnit = value;
        this.nNumericScale = BravoNumericScale.getNumericScaleUnitValue(this._numericScaleUnit);
    }

    private _zNumericScaleFormat: string = "N2";

    public get zNumericScaleFormat(): string {
        return this._zNumericScaleFormat;
    }

    public set zNumericScaleFormat(value: string) {
        this._zNumericScaleFormat = value;
    }

    private _zNumericScaleMember: string = String.empty;

    public get zNumericScaleMember(): string {
        return this._zNumericScaleMember;
    }

    public set zNumericScaleMember(value: string) {
        this._zNumericScaleMember = value;
    }

    private _mergedRanges: Array<wjg.CellRange> = null;

    public get mergedRanges(): Array<wjg.CellRange> {
        if (!this._mergedRanges)
            this._mergedRanges = new Array();

        return this._mergedRanges;
    }

    /**
     * Custom text for grand total label.
     */
    private _zGrandTotalText: string = String.empty;

    public get zGrandTotalText(): string {
        return this._zGrandTotalText;
    }

    public set zGrandTotalText(value: string) {
        this._zGrandTotalText = value;
    }

    public bExistsColumnWordWrap: boolean = false;

    private _grandTotalPosition: SubtotalPositionEnum = SubtotalPositionEnum.BelowData;

    /**
    * Determine whether position of grand total row is at top or bottom.
    */
    @Enum(SubtotalPositionEnum)
    public get grandTotalPosition(): SubtotalPositionEnum {
        return this._grandTotalPosition;
    }

    public set grandTotalPosition(value: SubtotalPositionEnum) {
        this._grandTotalPosition = value;
    }

    private _subtotalPosition: SubtotalPositionEnum = SubtotalPositionEnum.AboveData;

    @Enum(SubtotalPositionEnum)
    public get subtotalPosition(): SubtotalPositionEnum {
        return this._subtotalPosition;
    }

    public set subtotalPosition(value: SubtotalPositionEnum) {
        this._subtotalPosition = value;
    }

    //#endregion custom properties

    public readonly onAfterUpdateGroups = new wjc.Event();

    public readonly onBeforeUpdateGroups = new wjc.Event();

    public readonly onActiveItemChanged = new wjc.Event();

    public readonly evaluatingAutoTextCell = new Event();
    public onEvaluatingAutoTextCell(e?: wjg.FormatItemEventArgs) {
        this.evaluatingAutoTextCell.raise(this, e);
    }

    public readonly onRestrictedDOUColumn = new Event();
    public raiseOnRestrictedDOUColumn(e: RowColEventArgs) {
        e.cancel = true;
        this.onRestrictedDOUColumn.raise(this, e);
    }

    public readonly onContentWidthChanged = new Event();
    public raiseOnContentWidthChanged(e?: RowColEventArgs) {
        if (!e) e = new RowColEventArgs(null, -1, -1);
        this.onContentWidthChanged.raise(this, e);
    }

    public readonly onContentHeightChanged = new Event();
    public raiseOnContentHeightChanged(e?: RowColEventArgs) {
        if (!e) e = new RowColEventArgs(null, -1, -1);
        this.onContentHeightChanged.raise(this, e);
    }

    public readonly onCellActivated = new Event();

    protected ngUnsubscribe = new Subject();

    constructor(@Inject(ElementRef) elRef: ElementRef, @Inject(Injector) injector: Injector,
        @Inject('WjComponent') @SkipSelf() @Optional() parentCmp: any,
        @Inject(ChangeDetectorRef) cdRef: ChangeDetectorRef) {
        super(elRef, injector, parentCmp, cdRef);
    }

    created() {
        this.rows.defaultSize = 21;
        this.columns.defaultSize = 130;

        this.columnHeaders.rows.defaultSize = 21;
        this.columnFooters.rows.defaultSize = 21;
        this.rowHeaders.columns.defaultSize = 20;
        this.treeIndent = 0;
        this.groupHeaderFormat = '{name}: {value}';
        this.keyActionEnter = wjg.KeyAction.None;

        this.showSelectedHeaders = wjg.HeadersVisibility.All;

        this.cellFactory = new BravoCellFactory();
    }

    invalidate(fullUpdate?: boolean) {
        super.invalidate(fullUpdate);

        if (this.font != null) {
            if (this.hostElement) {
                this.hostElement.style.fontFamily = this.font.FontFamily;
                this.hostElement.style.fontSize = this.font.Size;

                if (this.font.FontStyle && this.hostElement.style.fontStyle != this.font.FontStyle)
                    this.hostElement.style.fontStyle = this.font.FontStyle;

                if (this.font.textDecoration && this.hostElement.style.textDecoration != this.font.textDecoration)
                    this.hostElement.style.textDecoration = this.font.textDecoration;
            }
        }
    }

    public collapseGroups(level: number, pIsDeep: boolean = true) {
        if (this.finishEditing()) {

            // set collapsed state for all rows in the grid
            this.deferUpdate(() => { // TFS 312828
                let rows = this.rows;
                rows.deferUpdate(() => {
                    for (let r = 0; r < rows.length; r++) {
                        let gr = rows[r];
                        if (gr instanceof wjg.GroupRow) {
                            let _flag = pIsDeep == true ? gr.level >= level : gr.level == level;
                            if (_flag)
                                gr.isCollapsed = true;
                            if (gr.isCollapsed && this.isHiddenRow(gr.index))
                                this.toggleRowVisibility(gr, true);
                        }
                    }
                });
            });
        }
    }

    public expandGroups(level: number, pIsDeep?: boolean) {
        if (this.finishEditing()) {

            // set collapsed state for all rows in the grid
            this.deferUpdate(() => { // TFS 312828
                let rows = this.rows;
                rows.deferUpdate(() => {
                    for (let r = 0; r < rows.length; r++) {
                        let gr = rows[r];
                        if (gr instanceof wjg.GroupRow) {
                            let _flag = pIsDeep ? gr.level >= level : gr.level == level
                            if (_flag)
                                gr.isCollapsed = false;
                            if (gr.isCollapsed && this.isHiddenRow(gr.index))
                                this.toggleRowVisibility(gr, true);
                        }
                    }
                });
            });
        }
    }

    public isHiddenRow(row: wjg.Row | number) {
        let _nRowIndex = row instanceof wjg.Row ? row.index : row;
        if (_nRowIndex < 0 || _nRowIndex > this.rows.length)
            return false;

        let _row = <wjg.Row>this.rows[_nRowIndex];
        if (_row == null) return false;

        return !_row.allowDragging && !_row.allowResizing && !_row.isReadOnly && !_row.visible;
    }

    public isCellCursor(pnRow: number, pnCol: number) {
        if (!this.selection && !this.selection.isValid) return false;

        if (this.selection.row2 == pnRow && this.selection.col2 == pnCol)
            return true;

        return false;
    }

    public getParentNode(row) {
        // get row level
        let startLevel = row instanceof (wjg.GroupRow) ? row.level : null;
        let startIndex = row.index;

        // travel up to find parent node
        for (let i = startIndex - 1; i >= 0; i--) {
            let thisRow = row.grid.rows[i],
                thisLevel = thisRow instanceof (wjg.GroupRow) ? thisRow.level : null;

            if (thisLevel != null) {
                if (startLevel == null || (startLevel > -1 && thisLevel < startLevel))
                    return thisRow;
            }
        }

        // not found
        return null;
    };

    ngOnInit() {
        super.ngOnInit();

        this.groupCollapsedChangedNg
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(e => {
                if (e instanceof wjg.CellRangeEventArgs)
                    this.raiseOnContentHeightChanged(new RowColEventArgs(e.panel, e.row, -1));
            });

        this.resizedColumnNg
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(e => {
                this.raiseOnContentWidthChanged(new RowColEventArgs(e.panel, -1, e.col));
            });

        let _host = this.hostElement;
        this.addEventListener(_host, 'mousedown', this._handleMouseDown.bind(this));
        this.addEventListener(_host, 'dblclick', this._handleDoubleClick.bind(this));
        this.addEventListener(_host, 'keydown', this._handleKeyDown.bind(this));

        this.resizedRowNg
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((e) => {
                if (e instanceof wjg.CellRangeEventArgs) {
                    this.writeRowLayout(e.panel.rows[e.row]);

                    this.raiseOnContentHeightChanged(new RowColEventArgs(e.panel, e.row, -1));
                }
            });

        /* this.selectionChangingNg.subscribe(e => {
            if (e instanceof wjg.CellRangeEventArgs) {
                if (!e.range.isSingleCell && this.selectionMode != wjg.SelectionMode.CellRange)
                    this.selectionMode = wjg.SelectionMode.CellRange;
                else if (e.range.isSingleCell && this.selectionMode == wjg.SelectionMode.CellRange)
                    this.selectionMode = wjg.SelectionMode.Row;
            }
        }) */

        this.initDefaultStyle();

        this.sortedColumnNg
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(e => {
                if (!this._bUpdateGroupFlag)
                    this.updateGroup(true);
            });

        this.addEventListener(this.hostElement, 'contextmenu', this.handleRightMouseButtonUp.bind(this));
    }

    public static formatAutoTextCell(p: wjg.GridPanel, r: number, c: number, cell: HTMLElement, rng?: wjg.CellRange, _cellData?: any) {
        let _g = <BravoWebGrid>p.grid,
            _col = <wjg.Column>p.columns[c],
            _row = <wjg.Row>p.rows[r];

        let _bIsFixed = p.cellType == wjg.CellType.ColumnHeader,
            _zColName = _col.name;

        if (!_bIsFixed && _zColName && _g.restrictedColumns.containsKey(_zColName)) {
            let _restrictCol = _g.restrictedColumns.get(_zColName),
                _bRestricted = _restrictCol ? ((<RestrictedColumnEnum>_restrictCol.value) &
                    RestrictedColumnEnum.NoOpen) != 0 : false;
            if (!_bRestricted && ((<RestrictedColumnEnum>_restrictCol.value) & RestrictedColumnEnum.NoOpenDOU) != 0) {
                var _r = new RowColEventArgs(p, r, c);
                _r.cancel = true;
                _g.raiseOnRestrictedDOUColumn(_r);
                _bRestricted = _r.cancel;
            }

            if (_bRestricted) {
                cell.textContent = NoDisplayPermissionContent;
                return;
            }
        }

        let _ct = _col.dataType;
        let _bIsUnbound = !_g.itemsSource;

        /* let _csDynamicStyle: CellStyle = null;
        if (_g.dynamicStyles && _g.dynamicStyles.length > 0 && _g.expressionEvaluator && !_bIsFixed) {
            if (_row.dataItem) {
                for (let _itemStyle of _g.dynamicStyles) {
                    if (_bIsUnbound) {
                        // if (!_csCell) continue;
                        continue;
                    }
                    else {
                        let _bIsAllCols = _itemStyle.zColumnList === BravoWebGrid.AllColumnValue;
                        if (!_bIsAllCols && _itemStyle.zColumnList.match(_zColName).length > 0)
                            continue;
                    }

                    let _zStyleValue: string = null;
                    let _key = {
                        row: r,
                        col: c,
                        value: _itemStyle.Name
                    }

                    let _zKey = JSON.stringify(_key);

                    if (this._cache) {
                        _zStyleValue = this._cache[_zKey];
                    }
                    else {
                        try {
                            _zStyleValue = String.format("{0}",
                                _g.expressionEvaluator.evaluate(_itemStyle.zStyleExpr, _row.dataItem));

                            if (!this._cache)
                                this._cache = {};

                            this._cache[_zKey] = _zStyleValue;
                        }
                        catch (_ex) {
                            throw _ex;
                        }
                    }

                    if (!_zStyleValue) continue;

                    let _zStyleName = _itemStyle.Name + "_" + _zStyleValue +
                        (_zColName ? _zColName : ExtensionsMethod.getTempName());

                    if (!_g.styles.containsKey(_zStyleName)) {
                        let _cs = CellStyle.parseString(_zStyleValue);
                        _g.addStyle(_zStyleName, _cs);
                        _csDynamicStyle = _cs;
                    }

                    cell.className += ' ' + _zStyleName;
                }
            }
        } */

        if (!cell.textContent)
            return;

        let _bIsUnboundStringCell = _bIsUnbound && wjc.isString(_cellData);
        let _bIsString = _bIsFixed || _ct == wjc.DataType.String || _bIsUnboundStringCell;

        if (_bIsString) {
            if (_g.autoTextMode != GridAutoTextContentEnum.None && _g.expressionEvaluator) {
                let _bAutoText = (_g.autoTextMode == GridAutoTextContentEnum.All ||
                    (_g.autoTextMode == GridAutoTextContentEnum.Fixed && _bIsFixed) ||
                    (_g.autoTextMode == GridAutoTextContentEnum.NonFixed && !_bIsFixed));
                if (_bAutoText) {
                    try {
                        if (_g.evaluatingAutoTextCell.hasHandlers) {
                            var _e = new wjg.FormatItemEventArgs(p, rng, cell);
                            _g.onEvaluatingAutoTextCell(_e);
                            cell.textContent = _e.cell.textContent;

                            if (_e.cancel) return;
                        }

                        if (ExtensionsMethod.isRtfString(cell.textContent))
                            cell.textContent = _g.expressionEvaluator.evaluateRtfText(cell.textContent, _row.dataItem);
                        else {
                            let _zText = _g.expressionEvaluator.evaluateText(cell.textContent, _row.dataItem);

                            if (_zText && _zText.match(/\n/ig)) {
                                _zText = _zText.replace(/\n/ig, '<br/>');
                                cell.innerHTML = _zText
                            }
                            else {
                                cell.textContent = _zText;
                            }
                        }
                    }
                    catch (_ex) {
                        cell.textContent = INVALID_VALUE;
                    }
                }
            }
        }

        if (_bIsFixed) return;

        let _bIsNumCol = _ct == wjc.DataType.Number;
        let _bDateCol = _ct == wjc.DataType.Date;
        let _zRawText = _bIsUnbound ? cell.textContent : `${_cellData}`;
        if ((_bIsUnbound || _bIsNumCol || _bDateCol) && _zRawText) {
            let _nVal = 0;

            if ((_g.hideZeroValue & GridDataCellEnum.Bound) != 0) {
                let _nVal = parseFloat(_zRawText);
                let _bIsHideDataBoundZero = _bIsNumCol && !_bIsUnbound && !isNaN(_nVal) && _nVal == 0;
                if (_bIsHideDataBoundZero) {
                    cell.textContent = '';
                    return;
                }
            }

            /*let _zFixedFormat: string = String.empty;
            if (_bIsUnbound) {
                // if (_csCell) _zFixedFormat = _csCell['Format'];
            }
            else {
                _zFixedFormat = _col.format;
            }
    
            let _zFormat: string = String.empty;
            // if (_csDynamicStyle && _csDynamicStyle['Format'])
            //     _zFormat = _csDynamicStyle['Format'];
            // else
            _zFormat = _g.expressionEvaluator.getFormat(_zFixedFormat);
    
            let _bIsAdjustFormat = _zFixedFormat && String.compare(_zFixedFormat, _zFormat) != 0;
            let _bIsScaleNum = !_bIsUnbound && _bIsNumCol && _g.nNumericScale != 1 &&
                (String.compare(_g.zNumericScaleMember, BravoWebGrid.AllColumnValue) == 0 ||
                    (_zColName && _g.zNumericScaleMember.match(_zColName).length > 0));
    
            try {
                if (_bIsNumCol || _bIsUnbound) {
                    _nVal = parseFloat(_zRawText);
                    if (!isNaN(_nVal)) {
                        if ((_g.hideZeroValue & GridDataCellEnum.Unbound) != 0 && _bIsUnbound && _nVal == 0) {
                            cell.textContent = String.empty;
                            return;
                        }
    
                        if (_bIsScaleNum) {
                            _nVal = _nVal / _g.nNumericScale;
    
                            if (_g.zNumericScaleFormat)
                                _zFormat = _g.expressionEvaluator.getFormat(_g.zNumericScaleFormat);
    
                            if (!_bIsAdjustFormat)
                                _bIsAdjustFormat = true;
                        }
    
                        if (_bIsAdjustFormat)
                            cell.textContent = wjc.format(_zFormat, _nVal);
                    }
                }
            }
            catch (_ex) {
                cell.textContent = INVALID_VALUE;
            }*/
        }
    }

    public getCellType(panel: GridPanel, row: number, col: number) {
        let _result: { cellType: GridCellTypeEnum, cs?: CellStyle } = { cellType: GridCellTypeEnum.None };
        if (!isCellValid(panel, row, col)) return _result;
        let _grd = <BravoWebGrid>panel.grid;

        let _bIsFixed = panel.cellType == wjg.CellType.ColumnHeader;
        let _colType = getCellType(panel.columns[col][StyleProp]);

        let _cst = BravoWebGrid.getCellStyle(panel, row, col, false);
        let _cellType = getCellType(_cst);

        _result.cellType = GridCellTypeEnum.Normal;
        _result.cs = _cst;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.Check) || _cellType == GridCellTypeEnum.Check)
            _result.cellType = GridCellTypeEnum.Check;
        else if ((!_bIsFixed && _colType == GridCellTypeEnum.img) || _cellType == GridCellTypeEnum.img)
            _result.cellType = GridCellTypeEnum.img;
        else if ((!_bIsFixed && _colType == GridCellTypeEnum.rtf) || _cellType == GridCellTypeEnum.rtf)
            _result.cellType = GridCellTypeEnum.rtf;
        else if ((!_bIsFixed && _colType == GridCellTypeEnum.link) || _cellType == GridCellTypeEnum.link)
            _result.cellType = GridCellTypeEnum.link;

        return _result;
    }

    public getCellIndent(row: number, col: number) {
        if (row < 0) return 0;

        if (!this.isCellValid(row, col) || col != this.nTreeColumnPos)
            return 0;

        let _row: wjg.Row = this.rows[row];
        let _parentRow = this.getParentNode(_row);

        if (_parentRow == null || _parentRow.level < 0)
            return 0;

        if (this.bGroupInColumn && this.groups.count > 0 &&
            !String.isNullOrEmpty(this.columns[col].name) &&
            this.groups.containsKey(this.columns[col].name))
            return 0;

        let _nLevel = _parentRow.level;
        return 8 * (_nLevel + 1);
    }

    private writeRowLayout(row: wjg.Row) {
        if (row == null) return;

        let _it = this.rowLayout.find(it => it.index == row.index);
        if (_it)
            _it.renderSize = row.renderSize;
        else
            this.rowLayout.push({ index: row.index, renderSize: row.renderSize });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        if (this._dynamicStyles) {
            this.clearDynamicStyles();
            this._dynamicStyles = null;
        }

        if (this._sumColumns) {
            this._sumColumns.clear();
            this._sumColumns = null;
        }

        if (this._restrictedColumns) {
            this._restrictedColumns.clear();
            this._restrictedColumns = null;
        }

        if (this._groups) {
            this._groups.clear();
            this._groups = null;
        }

        super.ngOnDestroy();
    }

    public onCellEditEnded(e: CellEditEndingEventArgs) {
        let _ecv = <wjc.IEditableCollectionView>this.collectionView;
        if (_ecv) _ecv.commitEdit();

        super.onCellEditEnded(e);
    }

    public onSortingColumn(e: wjg.CellRangeEventArgs) {
        if (this.isTreeNodeMode())
            e.cancel = true;

        return super.onSortingColumn(e);
    }

    public restoreDefaultSumColumns() {
        this.sumColumns.clear();
        this.sumColumns.add(BravoWebGrid.AllColumnValue, null);
    }

    public clearDynamicStyles() {
        if (this._dynamicStyles)
            this._dynamicStyles.clear()
    }

    public addDynamicStyle(pzName: string, pzStyleExpression: string, pzColumnList: string) {
        this.dynamicStyles.push(new DynamicStyleItem(pzName, pzStyleExpression, pzColumnList));
    }

    private _groupInColumnMergedRanges: Array<wjg.CellRange> = null;

    protected get groupInColumnMergedRanges(): Array<wjg.CellRange> {
        if (!this._groupInColumnMergedRanges)
            this._groupInColumnMergedRanges = new Array<wjg.CellRange>();

        return this._groupInColumnMergedRanges;
    }

    public getMergedRange(p: wjg.GridPanel, r: number, c: number, clip?: boolean) {
        if (!BravoCore.isDefined(p) || !BravoCore.isDefined(r) || !BravoCore.isDefined(c) ||
            r == -1 || c == -1)
            return super.getMergedRange(p, r, c, clip);

        let _rng: wjg.CellRange,
            _rows = p.rows,
            _columns = p.columns,
            _row: wjg.Row = _rows ? _rows[r] : null,
            _col: wjg.Column = _columns ? _columns[c] : null,
            _al = this.allowMerging,
            _bIsFixed = p.cellType != wjg.CellType.Cell;

        if (p.cellType == wjg.CellType.Cell && this.mergedRanges.length > 0) {
            for (const _rg of this.mergedRanges) {
                if (_rg.containsColumn(c) && _rg.containsRow(r)) {
                    let _rng = new wjg.CellRange(r, c);
                    for (let _i = _rng.col; _i < _rg.col2; _i++)
                        _rng.col2 = _i + 1;

                    for (let _i = _rng.col; _i > _rg.col; _i--)
                        _rng.col = _i - 1;

                    return _rng;
                }
            }
        }

        if (!_col.name) return super.getMergedRange(p, r, c, clip);

        if (this.bGroupInColumn && this.groups.count > 0 && _row instanceof wjg.GroupRow)
            return super.getMergedRange(p, r, c, clip)

        if (!_bIsFixed && this.bGroupInColumn && this.groups.count > 0 && this.groups.containsKey(_col.name)) {
            let _merged = this.groupInColumnMergedRanges.find(rng => rng.contains(r, c));
            if (_merged) return _merged;

            let _rng = super.getMergedRange(p, r, c, clip);
            if (!_rng) _rng = new wjg.CellRange(r, c);

            let _data = null, _data1 = null;

            for (let _i = _rng.row; _rows && _i < _rows.length - 1; _i++) {
                if (_i > _rng.row && _row instanceof wjg.GroupRow) break;

                _data = this.getCellData(_i, _rng.col, true);
                _data1 = this.getCellData(_i + 1, _rng.col, true)

                if (!_data || !_data1) break;
                let _bMatch = true;
                for (let _n = 0; _n < this._groups.count; _n++) {
                    let _zKey = this.groups.get(_n).key,
                        _col1 = <wjg.Column>_columns.find(c => c.name == _zKey);
                    if (_col1) break;

                    if (!_data === _data1) {
                        _bMatch = false;
                        break;
                    }

                    if (_col.name == _zKey) break;
                }

                if (!_bMatch) break;

                _rng.row2 = _i + 1;
            }

            for (let _i = _rng.row; _i > 0; _i--) {
                if (_row instanceof wjg.GroupRow) break;

                _data = this.getCellData(_i, _rng.col, true);
                _data1 = this.getCellData(_i - 1, _rng.col, true);

                if (!_data || !_data1) break;

                let _bMatch = true;
                for (let _n = 0; _n < this._groups.count; _n++) {
                    let _zKey = this.groups.get(_n).key,
                        _col1 = <wjg.Column>_columns.find(c => c.name == _zKey);
                    if (_col1) break;

                    if (!_data === _data1) {
                        _bMatch = false;
                        break;
                    }

                    if (_col.name == _zKey) break;
                }

                if (!_bMatch) break;

                _rng.row = _i - 1;
            }

            this.groupInColumnMergedRanges.push(_rng);
            return _rng;
        }

        if (p.cellType == wjg.CellType.ColumnHeader || (_al == wjg.AllowMerging.Cells && p.cellType == wjg.CellType.Cell)) {
            _rng = new wjg.CellRange(r, c);

            const UserDataProp = StyleElementFlags[StyleElementFlags.UserData];
            let _cs1 = null, _cs2 = null;

            for (var i = _rng.col; i < p.columns.length - 1; i++) {
                _cs1 = BravoWebGrid.getCellStyle(p, _rng.row, i);
                if (!_cs1 || !_cs1[UserDataProp])
                    break;

                _cs2 = BravoWebGrid.getCellStyle(p, _rng.row, i + 1)
                if (!_cs2 || !_cs2[UserDataProp])
                    break;

                if (_cs1[UserDataProp] !== _cs2[UserDataProp])
                    break;

                _rng.col2 = i + 1;
            }

            for (var i = _rng.col; i > 0; i--) {
                _cs1 = BravoWebGrid.getCellStyle(p, _rng.row, i);
                if (!_cs1 || !_cs1[UserDataProp])
                    break;

                _cs2 = BravoWebGrid.getCellStyle(p, _rng.row, i - 1)
                if (!_cs2 || !_cs2[UserDataProp])
                    break;

                if (_cs1[UserDataProp] !== _cs2[UserDataProp])
                    break;

                _rng.col = i - 1;
            }

            for (var i = _rng.row; i < p.rows.length - 1; i++) {
                _cs1 = BravoWebGrid.getCellStyle(p, i, _rng.col);
                if (!_cs1 || !_cs1[UserDataProp])
                    break;

                _cs2 = BravoWebGrid.getCellStyle(p, i + 1, _rng.col)
                if (!_cs2 || !_cs2[UserDataProp])
                    break;

                if (_cs1[UserDataProp] !== _cs2[UserDataProp])
                    break;

                _rng.row2 = i + 1;
            }

            for (var i = _rng.row; i > 0; i--) {
                _cs1 = BravoWebGrid.getCellStyle(p, i, _rng.col);
                if (!_cs1 || !_cs1[UserDataProp])
                    break;

                _cs2 = BravoWebGrid.getCellStyle(p, i - 1, _rng.col)
                if (!_cs2 || !_cs2[UserDataProp])
                    break;

                if (_cs1[UserDataProp] !== _cs2[UserDataProp])
                    break;

                _rng.row = i - 1;
            }

            return _rng;
        }

        if (_row instanceof wjg.GroupRow && !this.bGroupInColumn && (p.cellType == wjg.CellType.Cell ||
            p.cellType == wjg.CellType.ColumnFooter)) {
            _rng = new wjg.CellRange(r, c);

            if (this.nTreeColumnPos != -1 && c >= this.nTreeColumnPos && _col.aggregate == wjc.Aggregate.None) {
                while (_rng.col > this.nTreeColumnPos && _columns[_rng.col - 1] &&
                    _columns[_rng.col - 1].aggregate == wjc.Aggregate.None &&
                    _rng.col != _columns.frozen)
                    _rng.col--;

                while (_rng.col2 < _columns.length - 1 && _columns[_rng.col2 + 1] &&
                    _columns[_rng.col2 + 1].aggregate == wjc.Aggregate.None &&
                    _rng.col2 + 1 != _columns.frozen &&
                    !p.getCellData(_rng.row, _rng.col2 + 1, false))
                    _rng.col2++;
            }

            return _rng.isSingleCell ? null : _rng;
        }

        return super.getMergedRange(p, r, c, clip);
    }

    public readCellData(panel: GridPanel, row: number, col: number, pCellInfo: GridCellInfo) {
        if (panel == null || pCellInfo == null) return;

        pCellInfo.range = this.getMergedRange(panel, row, col) || new wjg.CellRange(row, col);
        pCellInfo.style = BravoWebGrid.getCellStyle(panel, row, col, false);

        let _cellElement = panel.getCellElement(row, col);
        if (_cellElement == null) {
            _cellElement = document.createElement('div');
            _cellElement.style.visibility = 'hidden';
            _cellElement.setAttribute(wjg.FlexGrid._WJS_MEASURE, 'true');

            panel.hostElement.appendChild(_cellElement);

            this.cellFactory.updateCell(panel, row, col, _cellElement, pCellInfo.range, true);
        }

        if (_cellElement) {
            _cellElement.className = _cellElement.className.replace('wj-state-selected', '');
            _cellElement.className = _cellElement.className.replace('wj-state-multi-selected', '');
        }

        pCellInfo.bounds = this.getCellRectDisplay(panel, row, col);
        pCellInfo.styleCss = getComputedStyle(_cellElement);
        pCellInfo.cellElement = _cellElement;

        if (pCellInfo.cellType == GridCellTypeEnum.img) {
            let _childElement = _cellElement.firstElementChild;
            if (_childElement instanceof HTMLElement) {
                switch (_childElement.tagName.toLowerCase()) {
                    case "img":
                        let _img = _childElement instanceof HTMLImageElement ? _childElement : null;
                        pCellInfo.image = Image.getImage(_img);

                        break;
                }
            }
        }

        let _col = <wjg.Column>panel.columns[col];

        if (_cellElement && _cellElement.querySelectorAll('br').length > 0)
            pCellInfo.zText = panel.getCellData(row, col, true);
        else if (_col != null && _col.dataType == wjc.DataType.Number)
            pCellInfo.zText = panel.getCellData(row, col, false);
        else if (_cellElement && _cellElement.textContent)
            pCellInfo.zText = _cellElement.textContent.trim();

        console.log(pCellInfo.zText, _cellElement.textContent);
    }

    public getCellRectDisplay(panel: wjg.GridPanel, row: number, col: number, raw?: boolean) {
        let _rng = this.getMergedRange(panel, row, col, true) || new wjg.CellRange(row, col);
        if (!_rng.isValid)
            return null;

        if (_rng.isSingleCell)
            return panel.getCellBoundingRect(row, col, raw);

        let _rowTop = <wjg.Row>panel.rows[_rng.topRow],
            _colLeft = <wjg.Column>panel.columns[_rng.leftCol],
            _nHeight = 0, _nWidth = 0;

        for (let _nCol = _rng.leftCol; _nCol <= _rng.rightCol; _nCol++)
            _nWidth += panel.columns[_nCol].renderSize;

        for (let _nRow = _rng.topRow; _nRow <= _rng.bottomRow; _nRow++)
            _nHeight += panel.rows[_nRow].renderSize;

        let _rc = new wjc.Rect(_colLeft.pos, _rowTop.pos, _nWidth, _nHeight);

        if (!raw) {
            let rcp = this.hostElement.getBoundingClientRect();
            _rc.left += rcp.left;
            _rc.top += rcp.top - this._offsetY;
        }

        if (row < this.rows.frozen) {
            _rc.top -= this.scrollPosition.y;
        }
        if (col < this.columns.frozen) {
            _rc.left -= this.scrollPosition.x * (this.rightToLeft ? -1 : +1);
        }

        // done
        return _rc;
    }

    public getDataIndex(row: wjg.Row | number) {
        let _nRowIndex: number = row instanceof wjg.Row ? row.index : row;
        if (_nRowIndex < 0 || _nRowIndex >= this.rows.length) return -1;

        let _cv = this.collectionView instanceof WebTable ? this.collectionView : null;
        if (_cv == null) return -1;

        let _row = this.rows[_nRowIndex];
        if (_row instanceof wjg.GroupRow && !this.isTreeNodeMode()) return -1;

        return _cv.items.findIndex(item => item == _row.dataItem);
    }

    public getDataRowFromCell(pnRow: number, pnCol: number): WebDataRow {
        return this.getDataRowFromIndex(this.getDataIndex(pnRow));
    }

    public getDataRowFromIndex(pnDataIndex: number) {
        if (!this.collectionView || pnDataIndex < 0)
            return null;

        try {
            if (this.collectionView instanceof WebTable)
                return this.collectionView.rows[pnDataIndex];
        }
        catch{

        }

        return null;
    }

    public getDataRow(row: wjg.Row | number) {
        let _nRowIndex: number = row instanceof wjg.Row ? row.index : row;
        return this.getDataRowFromIndex(this.getDataIndex(_nRowIndex));
    }

    protected initDefaultStyle(pbManualInitClass: boolean = true) {
        let _cs = CellStyle.parseString('TextAlign:CenterCenter;Font:,,style=Regular;Border:Flat,,#aaa,;WordWrap:True;ForeColor:#000000;');
        if (!this.styles.containsKey(CellStyleEnum.Fixed))
            this.styles.add(CellStyleEnum.Fixed, _cs);
        else
            this.styles.getValue(CellStyleEnum.Fixed).mergeWith(_cs);

        _cs = CellStyle.parseString('Font:,,style=Bold;BackColor:OldLace;Border:Flat,,,;Margins:2,2,2,2;');
        if (!this.styles.containsKey(CellStyleEnum.Subtotal0))
            this.styles.add(CellStyleEnum.Subtotal0, _cs);
        else
            this.styles.getValue(CellStyleEnum.Subtotal0).mergeWith(_cs);

        if (!this.styles.containsKey(CellStyleEnum.Subtotal1))
            this.styles.add(CellStyleEnum.Subtotal1, _cs);
        else
            this.styles.getValue(CellStyleEnum.Subtotal1).mergeWith(_cs);

        if (!this.styles.containsKey(CellStyleEnum.Subtotal2))
            this.styles.add(CellStyleEnum.Subtotal2, _cs);
        else
            this.styles.getValue(CellStyleEnum.Subtotal2).mergeWith(_cs);

        if (!this.styles.containsKey(CellStyleEnum.Subtotal3))
            this.styles.add(CellStyleEnum.Subtotal3, _cs);
        else
            this.styles.getValue(CellStyleEnum.Subtotal3).mergeWith(_cs);

        if (!this.styles.containsKey(CellStyleEnum.Subtotal4))
            this.styles.add(CellStyleEnum.Subtotal4, _cs);
        else
            this.styles.getValue(CellStyleEnum.Subtotal4).mergeWith(_cs);

        if (!this.styles.containsKey(CellStyleEnum.Subtotal5))
            this.styles.add(CellStyleEnum.Subtotal5, _cs);
        else
            this.styles.getValue(CellStyleEnum.Subtotal5).mergeWith(_cs);

        _cs = CellStyle.parseString('Font:,,style=Bold;BackColor:LightGoldenrodYellow;Border:Flat,,,;')
        if (!this.styles.containsKey(CellStyleEnum.GrandTotal))
            this.styles.add(CellStyleEnum.GrandTotal, _cs);
        else
            this.styles.getValue(CellStyleEnum.GrandTotal).mergeWith(_cs);

        _cs = CellStyle.parseString('BackColor:None;Border:Flat,,,;')
        if (!this.styles.containsKey(CellStyleEnum.Alternate))
            this.styles.add(CellStyleEnum.Alternate, _cs);
        else
            this.styles.getValue(CellStyleEnum.Alternate).mergeWith(_cs);

        _cs = CellStyle.parseString('Font:Segoe UI,11px,style=Regular;TextAlign:CenterCenter;Border:Flat,,#cccccc,;Margins:3,3,3,3;')
        if (!this.styles.containsKey(CellStyleEnum.RowHeader))
            this.styles.add(CellStyleEnum.RowHeader, _cs);
        else
            this.styles.getValue(CellStyleEnum.RowHeader).mergeWith(_cs);

        _cs = CellStyle.parseString('BackColor:None;Border:Flat,1,#dddddd,;Margins:1,1,1,1;ForeColor:#000000;');
        if (!this.styles.containsKey(CellStyleEnum.Normal))
            this.styles.add(CellStyleEnum.Normal, _cs);
        else
            this.styles.getValue(CellStyleEnum.Normal).mergeWith(_cs);

        _cs = CellStyle.parseString('BackColor:#0085c7;');
        if (!this.styles.containsKey(CellStyleEnum.Highlight))
            this.styles.add(CellStyleEnum.Highlight, _cs);
        else
            this.styles.getValue(CellStyleEnum.Highlight).mergeWith(_cs);

        if (pbManualInitClass) this.initDefaultClass();
    }

    private _id: string = null;

    public get id(): string {
        if (String.isNullOrEmpty(this._id))
            this._id = ExtensionsMethod.getTempName();

        return this._id;
    }

    protected initDefaultClass() {
        let _zDefaultClass = '';
        let _css = null, _zStyle = null;
        let _zId = this.id;
        for (const _key of this.styles.keys) {
            let _zParentStyle = null, _zStyleName = null;
            if (_key == CellStyleEnum.Fixed || _key == CellStyleEnum.RowHeader || _key == CellStyleEnum.Normal ||
                _key == CellStyleEnum.Alternate) {
                if (_key == CellStyleEnum.Fixed || _key == CellStyleEnum.RowHeader) {
                    _zParentStyle = _key == CellStyleEnum.Fixed ? "wj-colheaders" : "wj-rowheaders";
                    _zStyleName = "wj-header";
                }
                else if (_key == CellStyleEnum.Normal || _key == CellStyleEnum.Alternate) {
                    _zParentStyle = "wj-cells";
                    _zStyleName = _key == CellStyleEnum.Normal ? "wj-cell" : "wj-alt";
                }
            }
            else {
                if (Number.isNumber(_key))
                    _zStyleName = BravoWebGrid.BRC_PREFIX_CLASS + CellStyleEnum[_key].toLowerCase();
                else
                    _zStyleName = _key;
            }

            if (String.isNullOrEmpty(_zStyleName))
                continue;

            _zStyleName += ':not(.cell-rtf)';

            _css = CellStyle.buildCss(this.styles.getValue(_key));
            if (!_css) continue;

            _zStyle = BravoCore.toCssString(_css);

            if (_zParentStyle)
                _zDefaultClass += `#${_zId} .${_zParentStyle} .${_zStyleName} {${_zStyle}}`;
            else
                _zDefaultClass += `#${_zId} .${_zStyleName} {${_zStyle}}`;
        }

        let style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(_zDefaultClass));

        this.hostElement.id = _zId;
        this.hostElement.appendChild(style);
    }

    public addStyle(pzStyleName: string, pCellStyle: CellStyle) {
        let _css = CellStyle.buildCss(pCellStyle);
        if (_css == null) return;

        let _zCss = `#${this.id} .wj-cells .wj-cell.${pzStyleName}:not(.cell-rtf) {${BravoCore.toCssString(_css)}}`;

        let style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(_zCss));

        this.hostElement.appendChild(style);

        return pCellStyle;
    }

    public getCellStyle(pnRow: number, pnCol: number) {
        return BravoWebGrid.getCellStyle(this.cells, pnRow, pnCol);
    }

    public getCellRangeStyle(pnTopRow: number, pnLeftCol: number, pnBottomRow: number, pnRightCol: number) {
        return BravoWebGrid.getCellRangeStyle(this.cells, pnTopRow, pnLeftCol, pnBottomRow, pnRightCol);
    }

    private updateGrandTotalRow(): void {
        if (this.rows.length <= 0) return;

        let _grandTotalRow = this.rows.find(row => row.cssClass && row.cssClass.includes("bravo-grandtotal"));
        if (_grandTotalRow instanceof wjg.GroupRow)
            this.rows.remove(_grandTotalRow);

        if (!this.bAllowGrandTotal) return;

        let _nRow = this.grandTotalPosition == SubtotalPositionEnum.AboveData ? 0 : this.cells.rows.length;

        _grandTotalRow = new wjg.GroupRow();
        _grandTotalRow.cssClass = "bravo-grandtotal";

        if (_nRow == 0)
            this.cells.rows.insert(0, _grandTotalRow);
        else
            this.cells.rows.push(_grandTotalRow);

        let _zGrdTxt = this.zGrandTotalText;
        if (String.isNullOrEmpty(_zGrdTxt))
            BravoResourceManager.getString('GrandTotalItemText').subscribe(text => _zGrdTxt = text);

        let _col = this.columns[this.nTreeColumnPos];
        let _lastDataType: wjc.DataType;
        if (_col instanceof wjg.Column && _col.dataType != wjc.DataType.String) {
            _lastDataType = _col.dataType;
            _col.dataType = wjc.DataType.String;
        }

        try {
            this.cells.setCellData(_nRow, this.nTreeColumnPos, _zGrdTxt);
        }
        finally {
            if (_col instanceof wjg.Column && _lastDataType != null) {
                _col.dataType = _lastDataType;
            }
        }

        let _lstSum = this.createOrderedSumCols();
        for (const _col of _lstSum) {
            let _val = this.aggregate(AggregateEnum.Sum, 0, this.rows.length - 1, this.columns[_col].binding);
            this.cells.setCellData(_nRow, _col, _val);
        }
    }

    private createOrderedSumCols(): number[] {
        if (this.sumColumns.count < 1) return new Array<number>(0);

        let _colsSum = new Array<number>();
        for (let _nCol = this.columns.length - 1; _nCol >= 0; _nCol--) {
            if (!this.isSumCol(_nCol)) continue;

            if (this.sumColumns.containsKey(BravoWebGrid.AllColumnValue) ||
                this.sumColumns.containsKey(this.columns[_nCol].name)) {

                this.columns[_nCol].aggregate = wjc.Aggregate.Sum;
                _colsSum.push(_nCol);
            }
        }

        return _colsSum;
    }

    public getCurrentWidthOfCols(panel: GridPanel, fromCol: number, toCol: number) {
        if (toCol < 0 || toCol >= panel.columns.length ||
            fromCol < 0 || fromCol >= panel.columns.length)
            return 0;

        let _nTotalWidth = 0;
        for (let _nCol = fromCol; _nCol <= toCol; _nCol++) {
            const _col = panel.columns[_nCol];

            if (_col instanceof wjg.Column)
                _nTotalWidth += this.getCurrentWidthOfCol(panel, _nCol);
        }

        return _nTotalWidth;
    }

    public getCurrentWidthOfCol(panel: GridPanel, pnIndex: number) {
        if (pnIndex < 0 || pnIndex >= panel.columns.length) return 0;

        return panel.columns[pnIndex].renderWidth;
    }

    public getCurrentHeightOfRow(panel: GridPanel, pnIndex: number) {
        if (pnIndex < 0 || pnIndex >= panel.rows.length) return 0;

        return (<wjg.Row>panel.rows[pnIndex]).renderHeight;
    }

    public getCurrentHeightOfRows(fromRow?: number, toRow?: number, panel?: GridPanel) {
        let _nHeight = 0;

        if (fromRow == null && toRow == null) {
            for (const row of this.columnHeaders.rows) {
                if (row instanceof wjg.Row)
                    _nHeight += row.renderHeight;
            }

            for (const row of this.rows) {
                if (row instanceof wjg.Row)
                    _nHeight += row.renderHeight;
            }

            for (const row of this.columnFooters.rows) {
                if (row instanceof wjg.Row)
                    _nHeight += row.renderHeight;
            }

            return _nHeight;
        }

        for (let _nRow = fromRow; _nRow <= toRow; _nRow++)
            _nHeight += this.getCurrentHeightOfRow(panel || this.cells, _nRow);

        return _nHeight;
    }

    public isVerticalScrollable(delta: number) {
        if (this.rows.length < 0) return;

        if (delta > 0) {
            let _r = <wjg.Row>this.rows[this.rows.length - 1];
            let _srtg = <wjg.Row>this.rows[this.viewRange.bottomRow];
            return Math.abs(this.scrollPosition.y) < _r.pos - _srtg.pos;
        }
        else if (delta < 0) {
            return this.scrollPosition.y < 0;
        }
        else {
            let _r = <wjg.Row>this.rows[this.rows.length - 1];
            let _srtg = <wjg.Row>this.rows[this.viewRange.bottomRow];
            return _r.pos > _srtg.pos;
        }
    }

    public static getCheckColumnWidth(): number {
        return 23;
    }

    public groupBy(pzColName: string, pbManualUpdateGroup: boolean = false, pzText: string = '',
        pOrder: SortOrder = SortOrder.Ascending, pFunction: AggregateEnum = AggregateEnum.Sum): GroupColumnItem {
        if (!pzColName)
            throw new Error("pzColName");

        /* if (!this.columns.find(col => col.name === pzColName))
            throw new Error(String.format(MessageResources.ColumnDoesNotExist, pzColName)); */

        if (this.groups.containsKey(pzColName))
            throw new Error(String.format(MessageResources.GroupAlreadyExisted, pzColName));

        this.groups.add(pzColName, new GroupColumnItem(pzText, pOrder, pFunction));

        if (!pbManualUpdateGroup) this.updateGroup(false);

        return this.groups.getValue(pzColName);
    }

    private _bUpdateGroupFlag: boolean = false;

    public get bSuppressUpdateGroup(): boolean {
        return this._bUpdateGroupFlag;
    }

    public set bSuppressUpdateGroup(value: boolean) {
        this._bUpdateGroupFlag = value;
    }

    public clearGroup(pzColName: string, pbManualUpdateGroup: boolean = false) {
        if (String.isNullOrEmpty(pzColName) || !this.groups.containsKey(pzColName) ||
            this.isFixedGroup(pzColName))
            return;

        this.groups.remove(pzColName);

        if (this.columns.indexOf(pzColName) != -1 && this.isDefaultSortedColumn(pzColName) == SortFlags.None) {
            let _colSortDesc = this.getSortColumn(pzColName);
            if (_colSortDesc) this.collectionView.sortDescriptions.remove(_colSortDesc);
        }

        if (pbManualUpdateGroup) return;

        this.updateGroup(false);
    }

    public clearGroups(pbManualUpdateGroup: boolean = false) {
        if (this.groups.count < 1) return;

        for (let _n = this.groups.count - 1; _n >= 0; _n--) {
            let _item = this.groups.get(_n);
            if (this.columns.indexOf(_item.key) != -1) {
                let _value = _item.value as GroupColumnItem;
                if (_value.bFixed)
                    continue;

                if (this.isDefaultSortedColumn(_item.key) != SortFlags.None) {
                    let _colSortDesc = this.getSortColumn(_item.key);
                    if (_colSortDesc) this.collectionView.sortDescriptions.remove(_colSortDesc);
                }
            }

            this.groups.remove<string>(_item.key);
        }

        if (pbManualUpdateGroup) return;

        this.updateGroup(false);
    }

    public clearSort() {
        let _cv = this.collectionView;
        if (_cv == null) return;

        _cv.deferUpdate(() => {
            let _bHasSorted = false;
            for (let _nCol = 0; _nCol < this.columns.length; _nCol++) {
                const _col = <wjg.Column>this.columns[_nCol];

                if (String.isNullOrEmpty(_col.name) || !this.isSortableCol(_nCol) ||
                    this.groups.containsKey(_col.name))
                    continue;

                let _colSortDesc = this.getSortColumn(_col.name);
                if (_colSortDesc == null)
                    continue;

                if (!_bHasSorted) _bHasSorted = true;

                _cv.sortDescriptions.remove(_colSortDesc);
            }
        });

        this.updateGroupRowCssClass();

        // if (!_bHasSorted) return;
    }

    public updateGroup(pbIsSorted: boolean = false, pbRestoreLastNodeState: boolean = true): void {
        if (this.columns.length <= 0 || this.rows.length <= 0)
            return;

        if (this._bUpdateGroupFlag) return;
        this._bUpdateGroupFlag = true;

        if (this.bAllowRaisingUpdateGroupsEvents && this.onBeforeUpdateGroups.hasHandlers) {
            const _e = new wjc.CancelEventArgs();
            this.onBeforeUpdateGroups.raise(this, _e);
            if (_e.cancel) {
                this._bUpdateGroupFlag = false;
                return;
            }
        }

        let _cv = <WebTable>this.collectionView;
        if (_cv.groupDescriptions.length > 0)
            _cv.deferUpdate(() => _cv.groupDescriptions.clear());

        let _bLastUpdate = this.isUpdating;
        if (!_bLastUpdate) this.beginUpdate();

        try {
            if (this.groupInColumnMergedRanges) this.groupInColumnMergedRanges.clear();

            if (!pbIsSorted)
                this.sort();

            if (!this.zTreeColName || this.columns.indexOf(this.zTreeColName) == -1)
                this._nTreeColumnPos = this.columns.firstVisibleIndex;
            else
                this._nTreeColumnPos = this.columns.indexOf(this.zTreeColName);

            if (this.isTreeNodeMode()) {
                let _nLevel = -1, _row: wjg.Row = null,
                    _parentNode: wjg.GroupRow = null, _zTreeKeyValue: string = null;

                let _i = 0;

                for (let _nRow = 0; _nRow < this.rows.length; _nRow++) {
                    _row = this.rows[_nRow];
                    _zTreeKeyValue = this.getTreeNodeKeyValue(_row);

                    if (!_zTreeKeyValue) continue;

                    _parentNode = <wjg.GroupRow>this.getParentNode(_row);

                    let _treeNodes: string[] = null, _insertNode: wjg.GroupRow = null;
                    if (_nRow < this.rows.length - 1 && this.getTreeNodeKeyValue(_nRow + 1).startsWith(_zTreeKeyValue + ',')) {
                        _treeNodes = _zTreeKeyValue.split(',');

                        _insertNode = new wjg.GroupRow();
                        _insertNode.level = _treeNodes.length - 1;

                        this.rows.insert(_nRow, _insertNode);
                        _i++;

                        this.toggleRowVisibility(_row, false);

                        if (_insertNode.level > _nLevel + 1)
                            _insertNode.level = 0;

                        _nRow++;

                        if (!_insertNode.dataItem)
                            _insertNode.dataItem = {};

                        _insertNode.dataItem = _row.dataItem;
                    }
                    else if (_parentNode) {
                        _treeNodes = _zTreeKeyValue.split(',');
                        if (_treeNodes.length < 2) {
                            if (!_parentNode || _parentNode.level != -1) {
                                _insertNode = new wjg.GroupRow();
                                _insertNode.level = -1;

                                this.rows.insert(_nRow, _insertNode);
                            }
                        }
                        else if (_treeNodes.length - 2 != _nLevel) {
                            _insertNode = new wjg.GroupRow();
                            _insertNode.level = _treeNodes.length - 2;

                            this.rows.insert(_nRow, _insertNode);
                        }

                        if (_insertNode) {
                            _nRow++;
                            this.toggleRowVisibility(_insertNode, false);
                        }
                    }

                    if (_insertNode != null) _nLevel = _insertNode.level;
                }
            }
            else if (this.groups.count > 0 && this.bGroupInColumn) {
                let _bLastUpdate = _cv.isUpdating;
                if (!_bLastUpdate) _cv.beginUpdate();

                try {
                    for (let _n = 0; _n < this.groups.count; _n++) {
                        let _group = this.groups.get(_n),
                            _groupValue = <GroupColumnItem>_group.value,
                            _colGrp = this.getColumn(_group.key);
                        if (!_colGrp) continue;

                        let _zColCaption = String.empty;
                        if (_groupValue.text)
                            _zColCaption = _groupValue.text;

                        if (!_zColCaption)
                            _zColCaption = this.getColumnCaption(_group.key);

                        _colGrp.header = _zColCaption;

                        let _groupDesc = new wjc.PropertyGroupDescription(_group.key);
                        _cv.groupDescriptions.push(_groupDesc);
                    }
                }
                finally {
                    if (!_bLastUpdate) _cv.endUpdate();
                }
            }
            else if (this.groups.count > 0) {
                let _bLastUpdate = _cv.isUpdating;
                if (!_bLastUpdate) _cv.beginUpdate();

                try {
                    for (let _n = 0; _n < this.groups.count; _n++) {
                        let _group = this.groups.get(_n);
                        let _groupDesc = new wjc.PropertyGroupDescription(_group.key);

                        _cv.groupDescriptions.push(_groupDesc);
                    }
                }
                finally {
                    if (!_bLastUpdate) _cv.endUpdate();
                }
            }

            if (!this.bManualSumForGroup) this.updateSumCols();
            if (this.bAllowGrandTotal) this.updateGrandTotalRow();
        }
        finally {
            if (!_bLastUpdate) this.endUpdate();

            this._bUpdateGroupFlag = false;

            this.raiseOnContentHeightChanged();

            if (this.bAllowRaisingUpdateGroupsEvents) {
                this.onAfterUpdateGroups.raise(this, wjc.EventArgs.empty);
            }
        }
    }

    private raiseOnActiveItemChanged() {
        this.onActiveItemChanged.raise(this, wjc.CancelEventArgs.empty)
    }

    public debounceTime(pFunc, pnDelay) {
        let _timer = null;
        return function () {
            let _self = this,
                _args = arguments;
            clearTimeout(_timer);
            _timer = setTimeout(function () {
                pFunc.apply(_self, _args);
            }, pnDelay);
        }
    }

    public static getGroupHeader(pGroup: wjg.GroupRow): string {
        let grid = <BravoWebGrid>pGroup.grid,
            fmt = grid.groupHeaderFormat || wjc.culture.FlexGrid.groupHeaderFormat,
            group = wjc.tryCast(pGroup.dataItem, wjc.CollectionViewGroup) as wjc.CollectionViewGroup;

        if (group && fmt) {

            // get group info
            let propName = group.groupDescription['propertyName'],
                value = group.name,
                col = grid.getColumn(propName);

            let _grp = grid.groups.getValue(propName);
            if (_grp) {
                if (String.isNullOrEmpty(_grp.text))
                    fmt = "{value}";
                else
                    fmt = _grp.text + "{value}"
            }

            // customize with column info if possible
            let isHtml = pGroup.isContentHtml; // TFS 114902
            if (col) {
                isHtml = isHtml || col.isContentHtml;
                if (col.header) {
                    propName = col.header;
                }
                if (col.dataMap) {
                    value = col.dataMap.getDisplayValue(value);
                } else if (col.format) {
                    value = wjc.Globalize.format(value, col.format);
                }
            }

            // get count including all items (including items not on the current page,
            // as calculated when setting Column.Aggregate TFS 195467)
            let count = group.getAggregate(wjc.Aggregate.CntAll, null, grid.collectionView);
            //let count = group.items.length;

            // build header text
            return wjc.format(fmt, {
                name: wjc.escapeHtml(propName),
                value: isHtml ? value : wjc.escapeHtml(value),
                level: group.level,
                count: count
            });
        }
        return '';
    }

    private sort() {
        let _cv = this.collectionView;

        if (this.isTreeNodeMode()) {
            if (this.isDefaultSortedColumn(this.zMakingTreeNodeKeyColName) == SortFlags.None) {
                let _treeSortDesc = this.getSortColumn(this.zMakingTreeNodeKeyColName);
                if (this.columns.indexOf(this.zMakingTreeNodeKeyColName) != -1 && _treeSortDesc && !_treeSortDesc.ascending) {
                    _treeSortDesc._asc = true;
                }
                else {
                    _treeSortDesc = new wjc.SortDescription(this.zMakingTreeNodeKeyColName, true);
                    _cv.sortDescriptions.insert(0, _treeSortDesc);
                }
            }
        }
        else {
            let _treeSortDesc = this.getSortColumn(this.zMakingTreeNodeKeyColName);
            if (this.zMakingTreeNodeKeyColName && this.columns.indexOf(this.zMakingTreeNodeKeyColName) != -1 &&
                _treeSortDesc && this.isDefaultSortedColumn(this.zMakingTreeNodeKeyColName) == SortFlags.None)
                _cv.sortDescriptions.remove(_treeSortDesc);

            let _sortDescs = _cv.sortDescriptions;
            for (let _n = 0; _n < this.groups.count; _n++) {
                let _grpItem = this.groups.get(_n);

                if (this.columns.indexOf(_grpItem.key) == -1 ||
                    this.isDefaultSortedColumn(_grpItem.key) != SortFlags.None)
                    continue;

                let _grpValue = _grpItem.value as GroupColumnItem,
                    _grpOrder = _grpValue.order;

                let _treeDesc = _sortDescs.find(g => g.property == _grpItem.key);
                if (_treeDesc instanceof wjc.SortDescription)
                    _treeDesc._asc = true;
                else
                    _sortDescs.push(new wjc.SortDescription(_grpItem.key, _grpOrder == SortOrder.Ascending));
            }
        }
    }

    public isDefaultSortedColumn(pzColName: string): SortFlags {
        if (!pzColName) return SortFlags.None;

        if (this.zDataViewSortExprFormat == '{0}' || !this.zDataViewSortExprFormat)
            return SortFlags.None;

        if (this.zDataViewSortExprFormat.match(new RegExp(String.format(DESC_SORT_COLUMN_NAME_PATTERN_FORMAT, pzColName), 'gi')))
            return SortFlags.Descending;

        if (this.zDataViewSortExprFormat.match(new RegExp(String.format(COLUMN_NAME_PATTERN_FORMAT, pzColName), 'gi')))
            return SortFlags.Ascending;

        return SortFlags.None;
    }

    public toggleRowVisibility(row: wjg.Row, pbVisible: boolean) {
        row.height = pbVisible ? -1 : 0;
        row.allowDragging = row.allowResizing = row.isReadOnly = pbVisible;
        row.visible = pbVisible;
    }

    public getClipString(rng?: wjg.CellRange, csv?: boolean, headers?: boolean) {
        let _zCopyInfo = super.getClipString(rng, csv, headers);

        if (BravoExpressionEvaluator.containsExpression(_zCopyInfo) || (!_zCopyInfo && !rng)) {
            if (!rng) rng = this.selection;

            let _p = headers ? this.columnHeaders : this.cells;
            if (_p) {
                let _e = _p.getCellElement(rng.bottomRow, rng.leftCol);
                if (_e) _zCopyInfo = _e.textContent;
            }
        }

        return _zCopyInfo;
    }

    private restoreNodeState(nodes: any[] = null, pbRecursion: boolean = true) {
        if (this.groups.count < 0) return;

        if (nodes == null) nodes = this.rows.filter(r => r instanceof wjg.GroupRow);
        nodes.forEach(_r => {
            if (_r instanceof wjg.GroupRow &&
                _r.level >= 0 && _r.level <= this.groups.count) {
                let _g = this.groups.getValue(_r.level);
                console.log(_r);
            }
        })
    }

    public drawContentBorders(borderSide: Border3DSide = Border3DSide.All) {
        if ((borderSide & Border3DSide.Right) == Border3DSide.Right) {
            drawLine(this.columnHeaders, Border3DSide.Right);
            drawLine(this.cells, Border3DSide.Right);
            drawLine(this.columnFooters, Border3DSide.Right);
        }

        if ((borderSide & Border3DSide.Top) == Border3DSide.Top) {
            if (this.columnHeaders.rows.length > 0)
                drawLine(this.columnHeaders, Border3DSide.Top);
            else
                drawLine(this.cells, Border3DSide.Top);
        }

        if ((borderSide & Border3DSide.Bottom) == Border3DSide.Bottom) {
            if (this.columnFooters.rows.length > 0)
                drawLine(this.columnFooters, Border3DSide.Bottom);
            else if (this.rows.length > 0)
                drawLine(this.cells, Border3DSide.Bottom);
            else
                drawLine(this.columnHeaders, Border3DSide.Bottom);
        }

        if ((borderSide & Border3DSide.Left) == Border3DSide.Left) {
            drawLine(this.columnHeaders, Border3DSide.Left);
            drawLine(this.cells, Border3DSide.Left);
            drawLine(this.columnFooters, Border3DSide.Left);
        }
    }

    public aggregate(aggType: AggregateEnum, topRow: number, bottomRow: number, binding?: string) {
        var cnt = 0,
            cntn = 0,
            sum = 0,
            sum2 = 0,
            min = null,
            max = null,
            bnd = binding ? new wjc.Binding(binding) : null;

        for (var i = topRow; i <= bottomRow; i++) {
            var _row = this.rows[i];
            if (_row instanceof wjg.GroupRow || _row.height == 0) {
                continue;
            }

            var val = _row.dataItem;
            if (bnd) {
                val = bnd.getValue(val);
            }

            // aggregate
            if (val != null) {
                cnt++;
                if (min == null || val < min) {
                    min = val;
                }
                if (max == null || val > max) {
                    max = val;
                }
                if (Number.isNumber(val) && !isNaN(val)) {
                    cntn++;
                    sum += val;
                    sum2 += val * val;
                } else if (wjc.isBoolean(val)) {
                    cntn++;
                    if (val == true) {
                        sum++;
                        sum2++;
                    }
                }
            }
        }

        // return result
        var avg = cntn == 0 ? 0 : sum / cntn;
        switch (aggType) {
            case AggregateEnum.Average:
                return avg;
            case AggregateEnum.Count:
                return cnt;
            case AggregateEnum.Max:
                return max;
            case AggregateEnum.Min:
                return min;
            case AggregateEnum.Sum:
                return sum;
            case AggregateEnum.VarPop:
                return cntn <= 1 ? 0 : sum2 / cntn - avg * avg;
            case AggregateEnum.StdPop:
                return cntn <= 1 ? 0 : Math.sqrt(sum2 / cntn - avg * avg);
            case AggregateEnum.Var:
                return cntn <= 1 ? 0 : (sum2 / cntn - avg * avg) * cntn / (cntn - 1);
            case AggregateEnum.Std:
                return cntn <= 1 ? 0 : Math.sqrt((sum2 / cntn - avg * avg) * cntn / (cntn - 1));
        }

        // should never get here...
        throw 'Invalid aggregate type.';
    }

    private _handleDoubleClick(e: MouseEvent) {
        let _ht = this.hitTest(e);
        if (_ht && _ht.panel.cellType == wjg.CellType.Cell &&
            this.isCellValid(_ht.row, _ht.col)) {
            if (!this.checkGroupRow(_ht.row)) {
                this.onCellActivated.raise(this, EventArgs.empty);
            }
            else {
                let _gr = this.cells.rows[_ht.row];
                if (_gr instanceof wjg.GroupRow)
                    _gr.isCollapsed = !_gr.isCollapsed;
            }
        }
    }

    private _handleKeyDown(e: KeyboardEvent) {
        if (e.keyCode == wjc.Key.Enter && this.keyActionEnter == wjg.KeyAction.None) {
            let _rg = this.selection;
            if (_rg && _rg.isSingleCell && this.isCellValid(_rg.row, _rg.col))
                if (!this.checkGroupRow(_rg.row)) {
                    this.onCellActivated.raise(this, EventArgs.empty);
                }
                else {
                    let _gr = this.cells.rows[_rg.row];
                    if (_gr instanceof wjg.GroupRow)
                        _gr.isCollapsed = !_gr.isCollapsed;
                }
        }

    }

    private _handleMouseDown(e) {
        if (e.button == MouseButtons.Left && this.bGroupInColumn && this.groups.count > 0) {
            let _ht = this.hitTest(e),
                _ctrlKey = e.ctrlKey || e.metaKey;

            if (_ht.cellType == wjg.CellType.Cell && this.bGroupInColumn) {
                if (wjc.closestClass(e.target, wjg.CellFactory._WJC_COLLAPSE)) {
                    let _gr = this.getParentNode(_ht.panel.rows[_ht.row]);
                    if (_gr instanceof wjg.GroupRow) {
                        if (_ctrlKey) { // ctrl+click: collapse/expand entire outline to this level
                            this.collapseGroups(_gr.isCollapsed ? _gr.level + 1 : _gr.level);
                        }
                        else { // simple click: toggle this group
                            _gr.isCollapsed = !_gr.isCollapsed;
                        }

                        this.toggleRowVisibility(_gr, true);
                        return;
                    }
                }
            }
        }
    }

    private checkGroupRow(pnRow: number): boolean {
        if (isRowInValid(this.cells, pnRow)) return false;
        let _r = this.cells.rows[pnRow];
        if (_r instanceof wjg.GroupRow && _r.dataItem instanceof wjc.CollectionViewGroup)
            return true;

        return false;
    }

    public updateSumCols() {
        if (this.bManualSumForGroup || this.rows.length <= 0)
            return;

        let _bLastUpdating = this.rows.isUpdating;
        if (!_bLastUpdating) this.rows.beginUpdate();

        try {
            if (!this.bGroupInColumn)
                this.sumTreeNodes(this.rows.filter(r => r instanceof wjg.GroupRow));
        }
        finally {
            if (!_bLastUpdating) this.rows.endUpdate();
        }
    }

    public sumTreeNodes(nodeCollection: any[], lstSum: number[] = null) {
        if (!lstSum) lstSum = this.createOrderedSumCols();

        let _rng: wjg.CellRange = null, _val: any = null, _col: any = null;
        for (const _node of nodeCollection) {
            if (!(_node instanceof wjg.GroupRow)) continue;
            if (!_node.dataItem) _node.dataItem = {};

            _node.cssClass = String.format("bravo-subtotal{0}", _node.level < 0 || _node.level > 5 ? 0 : _node.level);
            _rng = _node.getCellRange();

            for (const _nCol of lstSum) {
                _col = this.columns[_nCol];
                if (!(_col instanceof wjg.Column)) continue;

                _val = this.aggregate(AggregateEnum.Sum, _rng.topRow, _rng.bottomRow, _col.binding);
                _node.dataItem[_col.binding] = _val;
            }
        }
    }

    public isTreeNodeMode(): boolean {
        return !String.isNullOrEmpty(this.zMakingTreeNodeKeyColName) && this.groups.containsKey(this.zMakingTreeNodeKeyColName);
    }

    private getTreeNodeKeyValue(row): string {
        if (row instanceof wjg.Row) {
            if (this.columns.getColumn(this.zMakingTreeNodeKeyColName) && row.dataItem)
                return String.format("{0}", row.dataItem[this.zMakingTreeNodeKeyColName]);
        }
        else {
            return this.getTreeNodeKeyValue(this.rows[row]);
        }

        return '';
    }

    public isSumCol(pnCol: number) {
        if ((this.columns[pnCol] && !this.columns[pnCol].visible) || !this.isNumericCol(pnCol))
            return false;

        if (this.sumColumns.containsKey(BravoWebGrid.AllColumnValue))
            return true;

        return this.sumColumns.containsKey(this.columns[pnCol].name);
    }

    public isNumericCol(pnCol: number) {
        if (pnCol < 0 || pnCol >= this.columns.length || !this.columns[pnCol].dataType)
            return false;

        return this.columns[pnCol].dataType == wjc.DataType.Number
    }

    public isCellValid(pnRow: number, pnCol: number) {
        return isCellValid(this.cells, pnRow, pnCol);
    }

    public setUserData(pPanel: wjg.GridPanel, pnRow: number, pnCol: number, pData: any) {
        if (isCellInValid(pPanel, pnRow, pnCol)) return;

        let _r = <wjg.Row>pPanel.rows[pnRow];
        if (!_r) return null;

        if (!_r['_ud'])
            _r['_ud'] = {};

        _r['_ud'][pnCol] = pData;
    }

    public getUserData(pPanel: wjg.GridPanel, pnRow: number, pnCol: number) {
        if (isCellInValid(pPanel, pnRow, pnCol)) return null;

        let _r = <wjg.Row>pPanel.rows[pnRow];
        if (!_r || !_r['_ud']) return null;

        return _r['_ud'][pnCol];
    }

    public static parseGridStyleString(pGrid: BravoWebGrid, value: string) {

    }

    public static resetRowColDefaultSize(pPanel: GridPanel, pnHeightPadding: number = 0, pnWidthPadding: number = 0) {
        if (pPanel == null) return;

        let _grid = pPanel.grid;
        if (_grid instanceof BravoWebGrid) {

        }
    }

    public static getColumnDataType(column: wjg.Column): wjc.DataType {
        return column.dataType;
    }

    public implementsInterface(interfaceName: string) {
        return interfaceName == 'IBravoControlBase';
    }

    public getColumnCaption(pnCol: number) {
        if (pnCol < 0 || pnCol >= this.columns.length)
            return String.empty;

        if (wjc.isString(pnCol))
            pnCol = this.columns.indexOf(pnCol);

        let _zColCaption = null;
        for (let _nRow = 0; _nRow < this.columnHeaders.rows.length; _nRow++) {
            let _rng = this.getMergedRange(this.columnHeaders, _nRow, pnCol, true);
            if (!_rng) continue;

            let _zText = this.columnHeaders.getCellData(_nRow, pnCol, true);
            if (_zText) {
                _zColCaption = _zText;
                break;
            }
        }

        return _zColCaption;
    }

    public static findStyleElements(pzStyle: string, pzElementNamePattern: string = null): Array<StyleElementMatch> {
        if (String.isNullOrEmpty(pzElementNamePattern)) {
            let _keys = Object.keys(StyleElementFlags).filter(k => Number.isNumber(StyleElementFlags[k]));
            pzElementNamePattern = _keys.join('|');
            pzElementNamePattern += '|' + GridMergeStyleElement;
        }

        let _ms = pzStyle.match(new RegExp(String.format(GridStyleElementPatternFormat, pzElementNamePattern), 'g'));
        if (_ms == null || _ms.length < 1) return new Array();
        let _l = new Array<StyleElementMatch>(_ms.length);
        for (let _i = 0; _i < _ms.length; _i++) {
            let _t = _ms[_i];
            let _ms1 = _t.match(new RegExp(String.format(GridStyleElementPatternFormat, pzElementNamePattern)));
            _l[_i] = new StyleElementMatch(_ms1);
        }

        return _l;
    }

    public static mergingGridCell(pGrid: BravoWebGrid, pnRow: number, pnCol: number,
        pzMergedKey: string, pzStyle: string) {
        if (pGrid == null) return null;

        let _p = pGrid.columnHeaders;

        if ((pnRow < 0 && pnRow >= _p.rows.length) || (pnCol < 0 && pnCol >= _p.columns.length))
            return;

        let _row = _p.rows[pnRow],
            _col = _p.columns[pnCol],
            _cs = BravoWebGrid.getCellStyle(_p, pnRow, pnCol, false);

        if (!String.isNullOrEmpty(pzStyle)) {
            let _cs1 = CellStyle.parseString(pzStyle);
            _cs.mergeWith(_cs1);
        }

        _cs[StyleElementFlags[StyleElementFlags.UserData]] = pzMergedKey;

        if (_row[StyleProp] == null)
            _row[StyleProp] = {};

        _row[StyleProp][_col.name] = _cs.buildString();

        return _cs;
    }

    public sortColumn(pCol: number, pFlag: SortFlags, pbSingleColumn: boolean = true) {
        let _cv = this.collectionView,
            _zColName = null;

        if (_cv == null) return;

        if (Number.isNumber(pCol) && pCol >= 0 && pCol < this.columns.length)
            _zColName = this.columns[pCol].name;
        else
            _zColName = pCol;

        if (!this.isSortableCol(pCol) || this.isDefaultSortedColumn(_zColName) != SortFlags.None)
            return;

        let _sortCollection = _cv ? _cv.sortDescriptions : null;

        if (_sortCollection.length <= 0) {
            let _sd = new wjc.SortDescription('', true);
            _sortCollection.insert(0, _sd);
        }

        let _colSortDesc = this.getSortColumn(_zColName);
        if (_colSortDesc)
            _sortCollection.remove(_colSortDesc);

        if (pFlag == SortFlags.Ascending || pFlag == SortFlags.Descending) {
            let _sd = new wjc.SortDescription(_zColName, pFlag == SortFlags.Ascending);
            _sortCollection.insert(0, _sd);
        }

        this.updateGroupRowCssClass();
    }

    private _autoContextMenu: BravoContextMenu;

    protected get autoContextMenu(): BravoContextMenu {
        if (this._autoContextMenu == null) {
            this._autoContextMenu = new BravoContextMenu(this.hostElement, true);

            this._autoContextMenu.itemSelected.addHandler(this.autoContextMenu_menuItemSelected.bind(this));

            let _item = new ToolStrip(BravoWebGrid.CollapseMenuItem, null, "Collapse");
            this._autoContextMenu.itemsSource.push(_item);

            _item = new ToolStrip(BravoWebGrid.ExpandMenuItem, null, "Expand");
            this._autoContextMenu.itemsSource.push(_item);

            this._autoContextMenu.itemsSource.push(new Spliter());

            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.AddRowColMenuItem, null, "Add row/column"));
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.InsertRowColMenuItem, null, "Insert row/column"));
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.DeleteRowColMenuItem, null, "Delete row/column"));

            this._autoContextMenu.itemsSource.push(new Spliter());

            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.SortAscendingMenuItem, null, "Sort A-Z"));
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.SortDescendingMenuItem, null, "Sort Z-A"));

            let _parentItem = new DropDownToolStrip(BravoWebGrid.CombineSortColumnMenuItem);
            _parentItem.isDroppedDownChanging.addHandler(this._autoContextMenu_DropDownChanging.bind(this));
            _parentItem.text = "Sort by column...";

            this._autoContextMenu.itemsSource.push(_parentItem);

            this._autoContextMenu.itemsSource.push(new Spliter());
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.GroupColumnMenuItem, null, "Group"));

            _parentItem = new DropDownToolStrip(BravoWebGrid.CombinedGroupColumnMenuItem);
            _parentItem.text = "Combined group...";
            _parentItem.isDroppedDownChanging.addHandler(this._autoContextMenu_DropDownChanging.bind(this));
            this._autoContextMenu.itemsSource.push(_parentItem);

            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.SumColumnMenuItem, null, "Sum total"));

            _parentItem = new DropDownToolStrip(BravoWebGrid.GrandTotalMenuItem);
            _parentItem.text = "Grand total";
            this._autoContextMenu.itemsSource.push(_parentItem);

            _parentItem.itemsSource.push(new ToolStrip(BravoWebGrid.HideGrandTotalMenuItem, null, "None"));
            _parentItem.itemsSource.push(new ToolStrip(BravoWebGrid.TopGrandTotalMenuItem, null, "At top"));
            _parentItem.itemsSource.push(new ToolStrip(BravoWebGrid.BottomGrandTotalMenuItem, null, "At bottom"));

            this._autoContextMenu.itemsSource.push(new Spliter());
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.FreezeMenuItem, null, "Freeze"));
            this._autoContextMenu.itemsSource.push(new Spliter());
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.FitSizeMenuItem, null, "Autofit size"));
            this._autoContextMenu.itemsSource.push(new ToolStrip(BravoWebGrid.DefaultSizeMenuItem, null, "Default size"));
        }

        return this._autoContextMenu;
    }

    private _autoContextMenu_DropDownChanging(s: DropDownToolStrip, e: wjc.CancelEventArgs) {
        if (s.isDroppedDown && !e.cancel) {
            if (s.selectedItem instanceof ToolStrip) {
                let _zGroupName = s.name;
                let _zItemName = s.selectedItem.name;
                if (String.compare(_zGroupName, BravoWebGrid.CombineSortColumnMenuItem) == 0) {
                    if (String.compare(_zItemName, BravoWebGrid.ClearSortColumnMenuItem) != 0) {
                        e.cancel = true;
                    }
                }
                else if (String.compare(_zGroupName, BravoWebGrid.CombinedGroupColumnMenuItem) == 0) {
                    if (!(String.compare(_zItemName, BravoWebGrid.GroupInColumnSettingMenuItem) == 0 ||
                        String.compare(_zItemName, BravoWebGrid.DataTreeMenuItem) == 0 ||
                        String.compare(_zItemName, BravoWebGrid.ClearGroupColumnMenuItem) == 0)) {
                        e.cancel = true;
                    }
                }
            }
        }
    }

    private autoContextMenu_menuItemSelected(s: BravoContextMenu, e: ItemDropDownEventArgs) {
        let _mi = e.item as ToolStrip;
        if (_mi == null) return;

        let _col = <wjg.Column>this.columns[this._nContextCol];
        let _bChecked = _mi.checked;

        if (String.compare(e.zGroupName, BravoWebGrid.CombineSortColumnMenuItem) == 0) {
            if (String.compare(e.zItemName, BravoWebGrid.ClearSortColumnMenuItem) == 0) {
                this.clearSort();
            }
            else {
                let _colSortDesc = this.getSortColumn(e.zItemName);

                let _bAsc = _colSortDesc ? _colSortDesc.ascending : null;
                let _order: SortFlags = SortFlags.None;

                if (_bAsc == true)
                    _order = SortFlags.Descending;
                else if (_bAsc == false)
                    _order = SortFlags.None;
                else
                    _order = SortFlags.Ascending;

                this.sortColumn(this.columns.indexOf(e.zItemName), _order);

                _mi.checked = !_bChecked;
            }
        }
        else if (String.compare(e.zGroupName, BravoWebGrid.CombinedGroupColumnMenuItem) == 0) {
            if (String.compare(e.zItemName, BravoWebGrid.GroupInColumnSettingMenuItem) == 0 ||
                String.compare(e.zItemName, BravoWebGrid.DataTreeMenuItem) == 0 ||
                String.compare(e.zItemName, BravoWebGrid.ClearGroupColumnMenuItem) == 0) {
                if (String.compare(e.zItemName, BravoWebGrid.ClearGroupColumnMenuItem) == 0) {
                    if (this.groups.count > 0) {
                        this.groups.clear();
                        this.updateGroup();
                    }
                }
                else if (String.compare(e.zItemName, BravoWebGrid.GroupInColumnSettingMenuItem) == 0) {
                    this.bGroupInColumn = !this.bGroupInColumn;
                    this.updateGroup(true);
                }
                else if (String.compare(e.zItemName, BravoWebGrid.DataTreeMenuItem) == 0) {
                    if (this.isTreeNodeMode())
                        this.clearGroups();
                    else
                        this.groupBy(this.zMakingTreeNodeKeyColName);
                }
            }
            else {
                let _item = e.item;

                if (_item.checked)
                    this.clearGroup(_item.name);
                else
                    this.groupBy(_item.name);

                _item.checked = this.groups.containsKey(_item.name);
            }
        }
        else if (String.compare(e.zGroupName, BravoWebGrid.GrandTotalMenuItem) == 0) {
            if (String.compare(e.zItemName, BravoWebGrid.TopGrandTotalMenuItem) == 0) {
                if (this.bAllowGrandTotal && this.grandTotalPosition == SubtotalPositionEnum.AboveData)
                    return;

                this.bAllowGrandTotal = true;
                this.grandTotalPosition = SubtotalPositionEnum.AboveData;
            }
            else if (String.compare(e.zItemName, BravoWebGrid.BottomGrandTotalMenuItem) == 0) {
                if (this.bAllowGrandTotal && this.grandTotalPosition == SubtotalPositionEnum.BelowData)
                    return;

                this.bAllowGrandTotal = true;
                this.grandTotalPosition = SubtotalPositionEnum.BelowData;
            }
            else {
                if (!this.bAllowGrandTotal) return;
                this.bAllowGrandTotal = false;
            }

            this.updateGrandTotalRow();

            this.raiseOnContentHeightChanged();
        }
        else if (String.compare(_mi.name, BravoWebGrid.CollapseMenuItem) == 0 ||
            String.compare(_mi.name, BravoWebGrid.ExpandMenuItem) == 0) {
            this._doExpandOrCollapse(this.hitTest(s.position), String.compare(_mi.name, BravoWebGrid.CollapseMenuItem) == 0);
        }
        else if (this._autoContextMenu.tag == GridBuiltInContextMenuEnum.ContextMenuForRowHeader) {
            let _nStartRow = this.selection.isSingleCell ? this._nContextRow : Math.min(this.selection.topRow, this._nContextRow);
            let _nEndRow = this.selection.isSingleCell ? this._nContextRow : Math.max(this.selection.bottomRow, this._nContextRow);

            if (this._nContextRow >= 0 && this._nContextRow < this.rowHeaders.rows.length)
                _nStartRow = _nEndRow = this._nContextRow;

            if (String.compare(_mi.name, BravoWebGrid.FitSizeMenuItem) == 0) {
                this.autoSizeRows(_nStartRow, _nEndRow, false);
            }
            else if (String.compare(_mi.name, BravoWebGrid.DefaultSizeMenuItem) == 0) {

            }
            else if (String.compare(_mi.name, BravoWebGrid.FreezeMenuItem) == 0) {
                if (_bChecked)
                    this.frozenRows = _nStartRow;
                else
                    this.frozenRows = _nEndRow + 1;
            }
            else if (String.compare(_mi.name, BravoWebGrid.DeleteRowColMenuItem) == 0) {

            }
            else if (String.compare(_mi.name, BravoWebGrid.InsertRowColMenuItem) == 0) {

            }
            else if (String.compare(_mi.name, BravoWebGrid.AddRowColMenuItem) == 0) {

            }
        }
        else if (this._autoContextMenu.tag == GridBuiltInContextMenuEnum.ContextMenuForColHeader) {
            let _nStartCol = this.selection.isSingleCell ? this._nContextCol : Math.min(this.selection.leftCol, this._nContextCol);
            let _nEndCol = this.selection.isSingleCell ? this._nContextCol : Math.max(this.selection.rightCol, this._nContextRow);

            if (String.compare(_mi.name, BravoWebGrid.SortAscendingMenuItem) == 0) {
                this.sortColumn(this._nContextCol, _bChecked ? SortFlags.None : SortFlags.Ascending);
            }
            else if (String.compare(_mi.name, BravoWebGrid.SortDescendingMenuItem) == 0) {
                this.sortColumn(this._nContextCol, _bChecked ? SortFlags.None : SortFlags.Descending);
            }
            else if (String.compare(_mi.name, BravoWebGrid.GroupColumnMenuItem) == 0) {
                let _bGroupChecked = this.groups.containsKey(_col.name);

                if (!_bGroupChecked) {
                    if (this.groups.count > 0)
                        this.clearGroups(true);

                    this.groupBy(_col.name);
                }
                else {
                    this.clearGroup(_col.name);
                }
            }
            else if (String.compare(_mi.name, BravoWebGrid.SumColumnMenuItem) == 0) {
                let _bSum = !_bChecked;
                if (this.sumColumns.containsKey(BravoWebGrid.AllColumnValue)) {
                    this.sumColumns.clear();

                    for (let _nCol = 0; _nCol < this.columns.length; _nCol++)
                        if (!String.isNullOrEmpty(this.columns[_nCol].name) && this.isNumericCol(_nCol))
                            this.sumColumns.add(this.columns[_nCol].name, null);
                }

                if (!String.isNullOrEmpty(_col.name)) {
                    if (!_bSum) {
                        if (this.sumColumns.containsKey(_col.name))
                            this.sumColumns.remove(_col.name);
                    }
                    else {
                        if (!this.sumColumns.containsKey(_col.name))
                            this.sumColumns.add(_col.name, null);
                    }
                }

                this.updateGroup(true);
            }
            else if (String.compare(_mi.name, BravoWebGrid.FitSizeMenuItem) == 0) {
                this.autoSizeColumns(_nStartCol, _nEndCol, false, 4);
                this.raiseOnContentWidthChanged(new RowColEventArgs(this.cells, -1, _nStartCol == _nEndCol ? _nStartCol : -1));
            }
            else if (String.compare(_mi.name, BravoWebGrid.DefaultSizeMenuItem) == 0) {
                let _bWidthChanged = false;
                for (let _nCol = _nStartCol; _nCol <= _nEndCol; _nCol++) {
                    if (_col.width > 0) {
                        _col.width = this.columns.defaultSize;
                        if (!_bWidthChanged) _bWidthChanged = true;
                    }
                }

                if (_bWidthChanged)
                    this.raiseOnContentWidthChanged(new RowColEventArgs(this.cells, -1, _nStartCol == _nEndCol ? _nStartCol : -1));
            }
            else if (String.compare(_mi.name, BravoWebGrid.FreezeMenuItem) == 0) {
                if (_bChecked)
                    this.frozenColumns = _nStartCol;
                else
                    this.frozenColumns = _nEndCol + 1;
            }
            else if (String.compare(_mi.name, BravoWebGrid.DeleteRowColMenuItem) == 0) {

            }
            else if (String.compare(_mi.name, BravoWebGrid.InsertRowColMenuItem) == 0) {

            }
            else if (String.compare(_mi.name, BravoWebGrid.AddRowColMenuItem) == 0) {

            }
        }
    }

    protected _doExpandOrCollapse(pHitInfo: wjg.HitTestInfo, pIsCollapse: boolean) {
        if (pHitInfo.cellType == wjg.CellType.Cell) {
            let _gr: wjg.GroupRow;
            /// all
            if (this.selection.row == 0 && this.selection.row2 >= this.rows.length - 1) {
                _gr = this._getGroupRow(this.rows[pHitInfo.row]);
                if (_gr) {
                    if (pIsCollapse) {
                        this.collapseGroups(_gr.level);
                    }
                    else {
                        this.expandGroups(_gr.level);
                    }
                }
                return;
            }
            /// range
            else if (this.selection.row != this.selection.row2) {
                let _row = Math.min(this.selection.row, this.selection.row2);
                let _row2 = Math.max(this.selection.row, this.selection.row2);
                if (_row <= pHitInfo.row && _row2 >= pHitInfo.row) {
                    for (let _n = _row; _n <= _row2; _n++) {
                        _gr = this._getGroupRow(this.rows[pHitInfo.row]);
                        if (_gr && _gr.isCollapsed != pIsCollapse) {
                            _gr.isCollapsed = pIsCollapse;
                            this.toggleRowVisibility(_gr, true);
                        }
                    }
                    return;
                }
            }
            /// just one
            _gr = this._getGroupRow(this.rows[pHitInfo.row]);
            if (_gr && _gr.isCollapsed != pIsCollapse) {
                _gr.isCollapsed = pIsCollapse;
                this.toggleRowVisibility(_gr, true);
            }
            return;
        }
    }

    private _getGroupRow(pRow: any) {
        if (this.bGroupInColumn) {
            return this.getParentNode(pRow);
        } else {
            return wjc.tryCast(pRow, wjg.GroupRow);
        }
    }

    protected handleRightMouseButtonUp(e: MouseEvent) {
        // let _bIsUpdating = this.isUpdating;
        // if (!_bIsUpdating) this.beginUpdate();

        try {
            let _hit = this.hitTest(e);
            let _p = _hit.point;
            let _ct = _hit.cellType;
            let _r: wjc.Rect = null,
                _y = _p.y;

            if (e && e.button == MouseButtons.Right) {
                let _bColMenu = (this.allowBuiltInContextMenu & GridBuiltInContextMenuEnum.ContextMenuForColHeader) != 0,
                    _bRowMenu = (this.allowBuiltInContextMenu & GridBuiltInContextMenuEnum.ContextMenuForRowHeader) != 0,
                    _bNodeMenu = (this.allowBuiltInContextMenu & GridBuiltInContextMenuEnum.ContextMenuForNode) != 0,
                    _bGridMenu = (this.allowBuiltInContextMenu & GridBuiltInContextMenuEnum.ContextMenuForGridHeader) != 0;

                if (this._autoContextMenu != null) {
                    this.autoContextMenu.tag = null;
                    this.autoContextMenu.selectedValue = -1;
                }

                if (_bColMenu && _ct == wjg.CellType.ColumnHeader) {
                    _r = this.columnHeaders.getCellBoundingRect(_hit.row, _hit.col);
                    _y = _r.bottom;

                    if (this.autoContextMenu.tag == null) {
                        this.autoContextMenu.tag = GridBuiltInContextMenuEnum.ContextMenuForColHeader;
                        _p = new wjc.Point(_p.x - 10, _y);
                    }
                }
                else if (_ct == wjg.CellType.RowHeader && _bRowMenu) {
                    _r = this.rowHeaders.getCellBoundingRect(_hit.row, _hit.col);
                    _y = _r.bottom;

                    this.autoContextMenu.tag = GridBuiltInContextMenuEnum.ContextMenuForRowHeader;
                    _p = new wjc.Point(_p.x, _y);
                }
                else if (_ct == wjg.CellType.Cell && _bNodeMenu) {
                    let _cell = this.cells.getCellElement(_hit.row, _hit.col);
                    let _btn = _cell ? _cell.querySelector('.wj-btn-glyph') : null;

                    if (wjc.contains(_btn, e.target))
                        this.autoContextMenu.tag = GridBuiltInContextMenuEnum.ContextMenuForNode;
                }

                if (this.autoContextMenu.tag != null) {
                    this._nContextCol = _hit.col;
                    this._nContextRow = _hit.row;

                    if (this.autoContextMenuOpening()) {
                        if (this.autoContextMenu._onLoadComplete()) {
                            this.autoContextMenu.show(_p);
                            this.autoContextMenu.position = _p;
                        }

                        e.preventDefault();
                    }
                }
            }
        }
        finally {
            // if (!_bIsUpdating) this.endUpdate();
        }
    }

    protected autoContextMenuOpening(): boolean {
        if ((this.rows.length + this.columnHeaders.rows.length) < 1 || this.columns.length < 1 || this._autoContextMenu.tag == null)
            return false;

        let _colName = this.columns[this._nContextCol].name
        let _rgSelect = this.selection;

        try {
            let _itemCollapse = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.CollapseMenuItem) as ToolStrip;
            let _itemExpand = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.ExpandMenuItem) as ToolStrip;

            BravoResourceManager.getString('CollapseMenuItemText').subscribe(text => _itemCollapse.text = text);
            BravoResourceManager.getString('ExpandMenuItemText').subscribe(text => _itemExpand.text = text);

            if (this._autoContextMenu.tag == GridBuiltInContextMenuEnum.ContextMenuForNode) {
                for (let _i = 0; _i < this._autoContextMenu.itemsSource.length; _i++)
                    this._autoContextMenu.itemsSource[_i].visible = this._autoContextMenu.itemsSource[_i] == _itemCollapse ||
                        this._autoContextMenu.itemsSource[_i] == _itemExpand;

                return true;
            }

            let _itemAddRowCol = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.AddRowColMenuItem) as ToolStrip;
            let _itemInsertRowCol = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.InsertRowColMenuItem) as ToolStrip;
            let _itemDeleteRowCol = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.DeleteRowColMenuItem) as ToolStrip;

            let _itemSortAZ = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.SortAscendingMenuItem) as ToolStrip;
            let _itemSortZA = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.SortDescendingMenuItem) as ToolStrip;
            let _itemMultiSort = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.CombineSortColumnMenuItem) as DropDownToolStrip;
            let _itemGroupColumn = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.GroupColumnMenuItem) as ToolStrip;
            let _itemMultiGroup = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.CombinedGroupColumnMenuItem) as DropDownToolStrip;
            let _itemSumColumn = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.SumColumnMenuItem) as ToolStrip;
            let _itemGrandTotal = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.GrandTotalMenuItem) as DropDownToolStrip;
            let _itemHideGrandTotal = _itemGrandTotal.itemsSource.find(item => item.name == BravoWebGrid.HideGrandTotalMenuItem) as ToolStrip;
            let _itemTopGrandTotal = _itemGrandTotal.itemsSource.find(item => item.name == BravoWebGrid.TopGrandTotalMenuItem) as ToolStrip;
            let _itemBottomGrandTotal = _itemGrandTotal.itemsSource.find(item => item.name == BravoWebGrid.BottomGrandTotalMenuItem) as ToolStrip;
            let _itemFreeze = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.FreezeMenuItem) as ToolStrip;
            let _itemFitSize = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.FitSizeMenuItem) as ToolStrip;
            let _itemDefaultSize = this._autoContextMenu.itemsSource.find(item => item.name == BravoWebGrid.DefaultSizeMenuItem) as ToolStrip;

            BravoResourceManager.getString('GrandTotalMenuItemText').subscribe(text => _itemGrandTotal.text = text);
            BravoResourceManager.getString('NoneGrandTotalItemText').subscribe(text => _itemHideGrandTotal.text = text);
            BravoResourceManager.getString('TopGrandTotalItemText').subscribe(text => _itemTopGrandTotal.text = text);
            BravoResourceManager.getString('BottomGrandTotalItemText').subscribe(text => _itemBottomGrandTotal.text = text);
            BravoResourceManager.getString('FreezeRowColMenuItemText').subscribe(text => _itemFreeze.text = text);
            BravoResourceManager.getString('AutoFitSizeMenuItemText').subscribe(text => _itemFitSize.text = text);
            BravoResourceManager.getString('DefaultSizeMenuItemText').subscribe(text => _itemDefaultSize.text = text);

            if (this._autoContextMenu.tag == GridBuiltInContextMenuEnum.ContextMenuForColHeader) {
                let _bIsHeaderOnly = this._nContextCol >= 0 && this._nContextCol < this.columnHeaders.columns.length;

                _itemDeleteRowCol.visible = this.bAllowDeletingColumn && !this.isReadOnly && !_bIsHeaderOnly;
                _itemAddRowCol.visible = this.bAllowAddingColumn && !this.isReadOnly;
                _itemInsertRowCol.visible = this.bAllowAddingColumn && !this.isReadOnly;

                BravoResourceManager.getString('RemoveSelectedColsMenuItemText').subscribe(text => _itemDeleteRowCol.text = text);
                BravoResourceManager.getString('AddNewColMenuItemText').subscribe(text => _itemAddRowCol.text = text);
                BravoResourceManager.getString('InsertNewColMenuItemText').subscribe(text => _itemInsertRowCol.text = text);

                _itemCollapse.visible = _itemExpand.visible = false;

                _itemSortAZ.visible = _itemSortZA.visible = this.bAllowSorting &&
                    _rgSelect.col == _rgSelect.col2 && this.isSortableCol(_rgSelect.col);
                BravoResourceManager.getString('SortAscendingMenuItemText').subscribe(text => _itemSortAZ.text = text);
                BravoResourceManager.getString('SortDescendingMenuItemText').subscribe(text => _itemSortZA.text = text);

                _itemMultiSort.visible = this.bAllowSorting;
                BravoResourceManager.getString('AdvancedSortByMenuItemText').subscribe(text => _itemMultiSort.text = text);

                _itemGroupColumn.visible = this.bAllowGrouping && _rgSelect.col == _rgSelect.col2 &&
                    !String.isNullOrEmpty(_colName) && this.isGroupableCol(_rgSelect.col);

                _itemMultiGroup.visible = this.bAllowGrouping;
                BravoResourceManager.getString('AdvancedGroupByMenuItemText').subscribe(text => _itemMultiGroup.text = text);

                _itemFreeze.visible = true;

                _itemFitSize.visible = _itemDefaultSize.visible =
                    this.allowResizing == wjg.AllowResizing.Both || this.allowResizing == wjg.AllowResizing.BothAllCells ||
                    this.allowResizing == wjg.AllowResizing.Columns || this.allowResizing == wjg.AllowResizing.ColumnsAllCells;

                if (_itemSortAZ.visible || _itemSortZA.visible) {
                    let _colSortDesc = this.getSortColumn(_colName);

                    _itemSortAZ.checked = _itemSortAZ.visible && _colSortDesc && _colSortDesc.ascending;
                    _itemSortZA.checked = _itemSortZA.visible && _colSortDesc && !_colSortDesc.ascending;
                }

                if (_itemGroupColumn.visible) {
                    BravoResourceManager.getString(String.compare(_colName, this.zMakingTreeNodeKeyColName) == 0 ? "DataTreeMenuItemText" : "QuickGroupByMenuItemText")
                        .subscribe(text => _itemGroupColumn.text = text);

                    _itemGroupColumn.checked = this.groups.containsKey(_colName);
                }

                if (_itemMultiSort.visible) {
                    _itemMultiSort.itemsSource.clear();

                    let _nCanSortCol = 0,
                        _bHasSorted = false;

                    for (let _nCol = 0; _nCol < this.columns.length; _nCol++) {
                        let _colName = this.columns[_nCol].name;
                        if (String.isNullOrEmpty(_colName))
                            continue;

                        if (!this.isSortableCol(_nCol))
                            continue;

                        let _item = new ToolStrip(_colName, null, this.getColumnCaption(_nCol));
                        _itemMultiSort.itemsSource.push(_item);

                        let _colSortDesc = this.collectionView ?
                            <wjc.SortDescription>this.collectionView.sortDescriptions.find(s => s.property == _colName) : null;

                        if (!_bHasSorted && _colSortDesc != null)
                            _bHasSorted = true;

                        _item.checked = _colSortDesc != null;

                        _nCanSortCol++;
                    }

                    if (_nCanSortCol < 1) {
                        _itemMultiSort.visible = false;
                    }
                    else if (_bHasSorted) {
                        _itemMultiSort.itemsSource.splice(0, 0, new Spliter());
                        let _item = new ToolStrip(BravoWebGrid.ClearSortColumnMenuItem, null, "Clear sort");
                        BravoResourceManager.getString('ClearSortMenuItemText').subscribe(text => _item.text = text);
                        _itemMultiSort.itemsSource.splice(0, 0, _item);
                    }
                }

                if (_itemMultiGroup.visible) {
                    _itemMultiGroup.itemsSource.clear();

                    let _item = new ToolStrip(BravoWebGrid.DataTreeMenuItem, null, "DataTreeMenuItemText");
                    BravoResourceManager.getString('DataTreeMenuItemText').subscribe(text => _item.text = text);
                    _itemMultiGroup.itemsSource.push(_item);
                    _item.visible = !String.isNullOrEmpty(this.zMakingTreeNodeKeyColName);

                    if (_item.visible) _item.checked = this.isTreeNodeMode();

                    _itemMultiGroup.itemsSource.push(new Spliter());

                    let _nCanGroupCol = 0;
                    for (let _nCol = 0; _nCol < this.columns.length; _nCol++) {
                        let _colName = this.columns[_nCol].name;
                        if (String.isNullOrEmpty(_colName) || String.compare(_colName, this.zMakingTreeNodeKeyColName) == 0)
                            continue;

                        if (!this.isGroupableCol(_nCol))
                            continue;

                        _item = new ToolStrip(_colName, null, this.getColumnCaption(_nCol));
                        _itemMultiGroup.itemsSource.push(_item);
                        _item.checked = this.groups.containsKey(_colName);
                        // _item.enabled = this.isFixedGroup(_colName);

                        _nCanGroupCol++;
                    }

                    if (_nCanGroupCol < 1) {
                        _itemMultiGroup.visible = false;
                    }
                    else {
                        if (this.groups.count > 0) {
                            _itemMultiGroup.itemsSource.splice(0, 0, new Spliter());
                            _item = new ToolStrip(BravoWebGrid.ClearGroupColumnMenuItem, null, "ClearGroupsMenuItemText");
                            BravoResourceManager.getString("ClearGroupsMenuItemText").subscribe(text => _item.text = text);
                            _itemMultiGroup.itemsSource.splice(0, 0, _item);
                        }

                        _itemMultiGroup.itemsSource.push(new Spliter());

                        _item = new ToolStrip(BravoWebGrid.GroupInColumnSettingMenuItem, null, "GroupInColumnMenuItemText");
                        BravoResourceManager.getString('GroupInColumnMenuItemText').subscribe(text => _item.text = text);
                        _itemMultiGroup.itemsSource.push(_item);
                        _item.visible = !this.isTreeNodeMode();

                        if (_item.visible) _item.checked = this.bGroupInColumn;
                    }
                }

                let _bCanSum = false, _bCanGrandTotal = false, _bNoSumCol = false;
                for (let _nCol = 0; _nCol < this.columns.length; _nCol++) {
                    if (!this.isNumericCol(_nCol))
                        continue;

                    let _colName = this.columns[_nCol].name;

                    if (!_bCanGrandTotal) _bCanGrandTotal = true;
                    if (_nCol == this._nContextCol && !String.isNullOrEmpty(_colName)) {
                        if (!_bCanSum) _bCanSum = true;
                        if (!_bNoSumCol && !this.isSumCol(_nCol))
                            _bNoSumCol = true;
                    }

                    if (_bCanGrandTotal && _bCanSum && _bNoSumCol)
                        break;
                }

                _itemSumColumn.visible = _bCanSum;
                if (_itemSumColumn.visible)
                    _itemSumColumn.checked = !_bNoSumCol;
                BravoResourceManager.getString('QuickGroupSumMenuItemText').subscribe(text => _itemSumColumn.text = text);

                _itemGrandTotal.visible = _bCanGrandTotal;
                if (_bCanGrandTotal) {
                    _itemHideGrandTotal.checked = !this.bAllowGrandTotal;
                    _itemTopGrandTotal.checked = this.bAllowGrandTotal && this.grandTotalPosition == SubtotalPositionEnum.AboveData;
                    _itemBottomGrandTotal.checked = this.bAllowGrandTotal && this.grandTotalPosition == SubtotalPositionEnum.BelowData;
                }

                if (_itemFreeze.visible)
                    _itemFreeze.checked = this.frozenColumns > 0 && this._nContextCol < this.frozenColumns;
            }
            else if (this._autoContextMenu.tag == GridBuiltInContextMenuEnum.ContextMenuForRowHeader) {
                let _rgSelect = this.getMergedRange(this.rowHeaders, this._nContextRow, this._nContextCol);
                if (_rgSelect == null) _rgSelect = new wjg.CellRange(this._nContextRow, this._nContextCol);

                let _bIsNewRowOnly = _rgSelect.topRow == _rgSelect.bottomRow &&
                    _rgSelect.topRow == this._nContextRow;
                let _bIsHeaderOnly = !_bIsNewRowOnly && this._nContextRow >= 0 && this._nContextRow < this.rowHeaders.columns.length;

                _itemDeleteRowCol.visible = this.allowDelete && !this.isReadOnly && !_bIsNewRowOnly && !_bIsHeaderOnly;
                _itemAddRowCol.visible = this.allowAddNew && !this.isReadOnly;
                _itemInsertRowCol.visible = this.allowAddNew && !this.isReadOnly;

                BravoResourceManager.getString('RemoveSelectedRowsMenuItemText').subscribe(text => _itemDeleteRowCol.text = text);
                BravoResourceManager.getString('InsertNewRowMenuItemText').subscribe(text => _itemInsertRowCol.text = text);
                BravoResourceManager.getString('AddNewRowMenuItemText').subscribe(text => _itemAddRowCol.text = text);

                _itemCollapse.visible = _itemExpand.visible = false;

                _itemSortAZ.visible = _itemSortZA.visible = _itemMultiSort.visible =
                    _itemGroupColumn.visible = _itemMultiGroup.visible = _itemMultiSort.visible = _itemSumColumn.visible = false;

                _itemFreeze.visible = true;

                _itemFitSize.visible = _itemDefaultSize.visible =
                    this.allowResizing == wjg.AllowResizing.Both || this.allowResizing == wjg.AllowResizing.BothAllCells ||
                    this.allowResizing == wjg.AllowResizing.Rows || this.allowResizing == wjg.AllowResizing.RowsAllCells;

                _itemDefaultSize.visible = true;

                let _bCanGrandTotal = false;
                for (let _nCol = 0; _nCol < this.columns.length; _nCol++) {
                    if (this.isNumericCol(_nCol)) {
                        _bCanGrandTotal = true;
                        break;
                    }
                }

                _itemGrandTotal.visible = _bCanGrandTotal;
                if (_bCanGrandTotal) {
                    _itemHideGrandTotal.visible = !this.bAllowGrandTotal;
                    _itemTopGrandTotal.visible = this.bAllowGrandTotal && this.grandTotalPosition == SubtotalPositionEnum.AboveData;
                    _itemBottomGrandTotal.visible = this.bAllowGrandTotal && this.grandTotalPosition == SubtotalPositionEnum.BelowData;
                }

                if (_itemFreeze.visible)
                    _itemFreeze.checked = this.frozenRows > 0 && this._nContextRow < this.frozenRows;
            }

            BravoWebGrid.autoUpdateSeparators(this._autoContextMenu.itemsSource);

            return true;
        }
        finally {
            if (this._autoContextMenu.collectionView)
                this._autoContextMenu.collectionView.refresh();
        }
    }

    protected static autoUpdateSeparators(pItemCollection: Array<any>) {
        for (let _i = 0; _i < pItemCollection.length; _i++) {
            if (pItemCollection[_i] instanceof Spliter) {
                let _bAvailableUp = false;
                let _bAvailableDown = false;

                for (let _j = _i - 1; _j >= 0; _j--) {
                    if (!pItemCollection[_j].visible)
                        continue;

                    if (pItemCollection[_j] instanceof Spliter)
                        break;

                    _bAvailableUp = true;
                    break;
                }

                for (let _j = _i + 1; _j < pItemCollection.length; _j++) {
                    if (!pItemCollection[_j].visible)
                        continue;

                    if (pItemCollection[_j] instanceof Spliter)
                        break;

                    _bAvailableDown = true;
                    break;
                }

                pItemCollection[_i].visible = _bAvailableDown && _bAvailableUp;
            }
        }
    }

    public isSortableCol(pnCol: number): boolean {
        if (pnCol < 0 || pnCol >= this.columns.length)
            return false;

        // if (Cols[pnCol].isIgnored()) return false;

        if (this.isTreeNodeMode() || !this.columns[pnCol].allowSorting) return false;

        return true;
    }

    public isGroupableCol(pnCol: number): boolean {
        if (pnCol < 0 || pnCol >= this.columns.length)
            return false;

        // if (Cols[pnCol].isIgnored()) return false;

        return true;
    }

    public isFixedGroup(pzGroupName: string): boolean {
        if (String.isNullOrEmpty(pzGroupName) || this.columns.indexOf(pzGroupName) == -1)
            return false;

        return this.groups.containsKey(pzGroupName) && this.groups.getValue(pzGroupName).bFixed;
    }

    public getSortColumn(pzColName: string): wjc.SortDescription {
        if (String.isNullOrEmpty(pzColName) || !this.collectionView)
            return;

        let _cv = this.collectionView;
        let _sortCollection = _cv.sortDescriptions;
        if (_sortCollection == null || _sortCollection.length < 1)
            return null;

        return _sortCollection.find(item => item.property == pzColName);
    }

    private updateGroupRowCssClass() {
        if (this.rows.length < 1) return;

        let _nodes = <Array<wjg.GroupRow>>this.rows.filter(row => row instanceof wjg.GroupRow);
        for (let _node of _nodes)
            _node.cssClass = String.format("bravo-subtotal{0}", _node.level < 0 || _node.level > 5 ? 0 : _node.level);
    }

    /* onRefreshed(e?: wjc.EventArgs) {
        if (this.bDrawContentBorders)
            this.drawContentBorders(Border3DSide.All);

        super.onRefreshed(e);
    } */
}

function isCellValid(pPanel: GridPanel, pnRow: number, pnCol: number) {
    return !isCellInValid(pPanel, pnRow, pnCol);
}

function isCellInValid(pPanel: GridPanel, pnRow: number, pnCol: number) {
    if (!isRowInValid(pPanel, pnRow))
        return isColInValid(pPanel, pnCol);

    return true;
}

function isColInValid(pPanel: GridPanel, pnCol: number) {
    if (pnCol >= 0)
        return pnCol >= pPanel.columns.length;

    return true;
}

function isRowInValid(pPanel: GridPanel, pnRow: number) {
    if (pnRow >= 0)
        return pnRow >= pPanel.rows.length;

    return true;
}

function drawLine(pPanel: GridPanel, borderSide: Border3DSide) {
    /* let _styleBorder = String.format('{0}px solid rgba(0,0,0,.2)', BravoSettings.toCurrentDpiXWithBorder(1));

    let _host: HTMLElement = null;

    if (pPanel.cellType == wjg.CellType.ColumnHeader)
        _host = pPanel.grid._eCHdr;
    else if (pPanel.cellType == wjg.CellType.ColumnFooter)
        _host = pPanel.grid._eCFtr;
    else if (pPanel.cellType == wjg.CellType.Cell)
        _host = pPanel.hostElement;

    if (!_host) return;

    let _grid = <BravoWebGrid>pPanel.grid;

    let _bDrawHeight = false,
        _bDrawWidth = false;
    if ((borderSide & Border3DSide.Top) == Border3DSide.Top) {
        _host.style.borderTop = _styleBorder;
        _bDrawHeight = true;
    }
    else if ((borderSide & Border3DSide.Bottom) == Border3DSide.Bottom) {
        // pPanel.grid._root.style.borderBottom = _styleBorder;
        // _bDraw = true
    }
    else if ((borderSide & Border3DSide.Left) == Border3DSide.Left) {
        _host.style.borderLeft = _styleBorder;
        _bDrawWidth = true;
    }
    else if ((borderSide & Border3DSide.Right) == Border3DSide.Right) {
        // pPanel.grid._root.style.borderRight = _styleBorder;
        // _bDraw = true;
    }

    if (_bDrawHeight) {
        _host.style.height = (_host.offsetHeight + BravoSettings.toCurrentDpiXWithBorder(1)) + 'px';
        // _grid.height += BravoSettings.toCurrentDpiXWithBorder(1);
        // pPanel.grid._eSz.style.height = (pPanel.grid._eSz.offsetHeight + BravoSettings.toCurrentDpiXWithBorder(1)) + 'px';
    }

    if (_bDrawWidth) {
        // _host.style.width = (_host.offsetWidth + BravoSettings.toCurrentDpiXWithBorder(1)) + 'px';
        // _grid.width += BravoSettings.toCurrentDpiXWithBorder(1);
        // pPanel.grid._eSz.style.width = (pPanel.grid._eSz.offsetWidth + BravoSettings.toCurrentDpiXWithBorder(1)) + 'px';
    } */

    let _grid = <BravoWebGrid>pPanel.grid;

    let _eCell: HTMLElement = null,
        _styleBorder = String.format('{0}px solid {1}', BravoSettings.toCurrentDpiXWithBorder(1), _grid.contentBorderColor.toString());

    if ((borderSide & Border3DSide.Top) == Border3DSide.Top || (borderSide & Border3DSide.Bottom) == Border3DSide.Bottom) {
        for (let _n = 0; _n < pPanel.columns.length; _n++) {
            let _nRow = (borderSide & Border3DSide.Top) == Border3DSide.Top ? 0 : pPanel.rows.length - 1;
            _eCell = pPanel.getCellElement(_nRow, _n);

            if (!_eCell) continue;

            if ((borderSide & Border3DSide.Top) == Border3DSide.Top)
                _eCell.style.borderTop = _styleBorder;
            else
                _eCell.style.borderBottom = _styleBorder;
        }
    }

    if ((borderSide & Border3DSide.Left) == Border3DSide.Left || (borderSide & Border3DSide.Right) == Border3DSide.Right) {
        for (let _n = 0; _n < pPanel.rows.length; _n++) {
            let _nCol = (borderSide & Border3DSide.Left) == Border3DSide.Left ? 0 : pPanel.columns.length - 1;
            _eCell = pPanel.getCellElement(_n, _nCol);

            if (!_eCell) continue;

            if ((borderSide & Border3DSide.Left) == Border3DSide.Left)
                _eCell.style.borderLeft = _styleBorder;
            else
                _eCell.style.borderRight = _styleBorder;
        }
    }
}

export class GroupColumnItem {
    private _func: AggregateEnum = AggregateEnum.Sum;

    public get func(): AggregateEnum {
        return this._func;
    }

    public set func(val: AggregateEnum) {
        this._func = this.func;
    }

    private _order: SortOrder = SortOrder.Ascending;

    public get order(): SortOrder {
        return this._order;
    }

    public set order(val: SortOrder) {
        this._order = val;
    }

    private _text: string = null;

    public get text(): string {
        return this._text;
    }

    public set text(val: string) {
        this._text = val;
    }

    private _bFixed: boolean;

    public get bFixed(): boolean {
        return this._bFixed;
    }

    public set bFixed(val: boolean) {
        this._bFixed = val;
    }

    constructor(pzText: string, pOrder: SortOrder = SortOrder.Ascending, pFunction: AggregateEnum = AggregateEnum.Sum) {
        this._text = pzText;
        this._order = pOrder;
        this._func = pFunction;
    }
}

export class RaiseFormatItemEventArgs extends wjg.FormatItemEventArgs {
}

export class CellStyle {
    public static parseString(pzStyle: string): CellStyle {
        if (!pzStyle) return;
        let _styles = pzStyle.split(/:|;/),
            _style: CellStyle = new CellStyle();
        if (_styles && _styles.length > 2) {
            _styles = _styles.splice(0, _styles.length - 1);
            for (let _n = 0; _n < _styles.length; _n += 2) {
                let _zKey = _styles[_n],
                    _value = _styles[_n + 1];

                if (_zKey == StyleElementFlags[StyleElementFlags.ForeColor] &&
                    _value && !_value.includes('rgb') && _value.includes(',')) {
                    _style[_zKey] = `rgba(${_value})`;
                    continue;
                }

                if (_zKey == StyleElementFlags[StyleElementFlags.Border] && _value.includes(',')) {
                    _style[_zKey] = _value;
                    continue;
                }

                _style[_zKey] = _value ? _value.trimChars("\"") : String.empty;
            }
        }

        return _style;
    }

    public static buildCss(pCellStyle: CellStyle, e?: StyleElementFlags) {
        if (!pCellStyle || !wjc.isObject(pCellStyle)) return null;
        let _css = {};

        for (let _zKey in pCellStyle) {
            let _zStyleValue: string = pCellStyle[_zKey];

            if (e != null && _zKey != StyleElementFlags[e])
                continue;

            switch (StyleElementFlags[_zKey]) {
                case StyleElementFlags.TextAlign:
                case StyleElementFlags.ImageAlign:
                    if (_zStyleValue) {
                        let _zHTextAlign: string, _zVTextAlign: string;
                        if (_zStyleValue.startsWith('Right'))
                            _zHTextAlign = 'flex-end';
                        else if (_zStyleValue.startsWith('Center'))
                            _zHTextAlign = 'center';
                        else
                            _zHTextAlign = 'flex-start';

                        if (_zStyleValue.endsWith('Top'))
                            _zVTextAlign = 'flex-start'
                        else if (_zStyleValue.endsWith('Bottom'))
                            _zVTextAlign = 'flex-end'
                        else
                            _zVTextAlign = 'center'

                        _css['display'] = 'flex';
                        _css['justify-content'] = _zHTextAlign;
                        _css['align-items'] = _zVTextAlign;

                        if (_zHTextAlign == 'center')
                            _css['text-align'] = 'center';
                    }
                    break;
                case StyleElementFlags.BackColor:
                    if (_zStyleValue !== "None") _css['background-color'] = `${_zStyleValue}`;

                    break;
                case StyleElementFlags.ForeColor:
                    if (_zStyleValue !== "None") _css['color'] = _zStyleValue;
                    break;
                case StyleElementFlags.Font:
                    let _zStyleFont = _zStyleValue.split(',');
                    if (_zStyleFont.length >= 3) {
                        if (_zStyleFont[0])
                            _css['font-family'] = _zStyleFont[0];

                        if (_zStyleFont[1]) {
                            var _zFontSize = _zStyleFont[1];
                            _css['font-size'] = _zFontSize;
                        }

                        if (_zStyleFont[2]) {
                            let _zFontStyle = _zStyleValue.substring(_zStyleValue.indexOf('style='));
                            if (_zFontStyle.includes('Italic'))
                                _css['font-style'] = 'italic';

                            if (_zFontStyle.includes('Bold'))
                                _css['font-weight'] = 'bold';
                            else if (_zFontStyle.includes('Regular'))
                                _css['font-weight'] = 'normal';

                            if (_zFontStyle.includes('Underline') && _zFontStyle.includes('Strikeout')) {
                                _css['text-decoration'] = 'underline line-through';
                            }
                            else {
                                if (_zFontStyle.includes('Underline'))
                                    _css['text-decoration'] = 'underline';

                                if (_zFontStyle.includes('Strikeout'))
                                    _css['text-decoration'] = 'line-through';
                            }
                        }
                    }

                    break;
                case StyleElementFlags.TextDirection:
                    break;

                case StyleElementFlags.Border:
                    let _borders = _zStyleValue.split(',');
                    if (_borders == null || _borders.length > 4) break;

                    let _nBorderSize = 1;
                    if (!String.isNullOrEmpty(_borders[1]) && Number.isNumber(_borders[1]))
                        _nBorderSize = Number.asNumber(_borders[1]);

                    _nBorderSize = BravoSettings.toCurrentDpiXWithBorder(_nBorderSize);

                    let _borderColor = _borders[2] || '#dddddd',
                        _borderStyle = _borders[0] || 'solid';

                    if (_borderStyle == "Flat") _borderStyle = 'solid';

                    if (_borderStyle.toLowerCase() == "none") {
                        _css['border-style'] = _borderStyle;
                    }
                    else {
                        if (_borders[3] == "Vertical") {
                            _css['border-right-width'] = String.format("{0}px", _nBorderSize);
                            _css['border-right-style'] = _borderStyle;
                            _css['border-right-color'] = _borderColor;
                        }
                        else if (_borders[3] == "Horizontal") {
                            _css['border-bottom-width'] = String.format("{0}px", _nBorderSize);
                            _css['border-bottom-style'] = _borderStyle;
                            _css['border-bottom-color'] = _borderColor;
                        }
                        else {
                            _css['border-right-width'] = String.format("{0}px", _nBorderSize);
                            _css['border-right-style'] = _borderStyle;
                            _css['border-right-color'] = _borderColor;
                            _css['border-bottom-width'] = String.format("{0}px", _nBorderSize);
                            _css['border-bottom-style'] = _borderStyle;
                            _css['border-bottom-color'] = _borderColor;
                        }
                    }

                    break;

                case StyleElementFlags.Margins:
                    let _margins = _zStyleValue.split(',');
                    if (_margins == null || _margins.length != 4) break;

                    _css['padding-bottom'] = (+_margins[0] + CellPadding) + 'px';
                    _css['padding-left'] = (+_margins[1] + CellPadding) + 'px';
                    _css['padding-right'] = (+_margins[2] + CellPadding) + 'px';
                    _css['padding-top'] = (+_margins[3] + CellPadding) + 'px';

                    break;
                case StyleElementFlags.WordWrap:
                    if (BravoDataTypeConverter.convertValue(_zStyleValue, TypeCode.Boolean) == true)
                        _css['white-space'] = 'normal';
                    break;
                case StyleElementFlags.LineHeight:
                    /* if (_zFontSize && _zFontSize != _zStyleValue)
                        _css['line-height'] = _zFontSize;
                    else if (_zStyleValue)
                        _css['line-height'] = _zStyleValue */
                    break;
                case StyleElementFlags.BackgroundImage:
                    let _zValue = ExtensionsMethod.deserializebase64(_zStyleValue);
                    let _imageData = String.format("data:image/jpeg;base64,{0}", _zValue);

                    _css['background-image'] = 'url(' + _imageData + ')';
                    _css['background-repeat'] = 'no-repeat';
                    _css['background-size'] = '70%';

                    break;
                case StyleElementFlags.BackgroundImageLayout:

                    _css['background-position'] = 'center center';

                    break;
            }
        }

        return _css;
    }

    clone() {
        let _keys = Object.keys(StyleElementFlags),
            _cs = new CellStyle();

        _keys.forEach(_key => {
            if (this[_key]) _cs[_key] = this[_key];
        })

        return _cs;
    }

    buildString(e?: StyleElementFlags) {
        if (!e) e = StyleElementFlags.All;

        let _zStyle = '';
        if (e & StyleElementFlags.TextAlign)
            _zStyle += this.getElement(StyleElementFlags.TextAlign);

        if (e & StyleElementFlags.ImageAlign)
            _zStyle += this.getElement(StyleElementFlags.ImageAlign);

        if (e & StyleElementFlags.WordWrap)
            _zStyle += this.getElement(StyleElementFlags.WordWrap);

        if (e & StyleElementFlags.BackColor)
            _zStyle += this.getElement(StyleElementFlags.BackColor);

        if (e & StyleElementFlags.ForeColor)
            _zStyle += this.getElement(StyleElementFlags.ForeColor);

        if (e & StyleElementFlags.Border)
            _zStyle += this.getElement(StyleElementFlags.Border);

        if (e & StyleElementFlags.Font)
            _zStyle += this.getElement(StyleElementFlags.Font);

        if (e & StyleElementFlags.Format)
            _zStyle += this.getElement(StyleElementFlags.Format);

        if (e & StyleElementFlags.UserData)
            _zStyle += this.getElement(StyleElementFlags.UserData);

        return _zStyle;
    }

    mergeWith(pCellStyle: CellStyle) {
        if (!pCellStyle) return;

        let _props = Object.keys(pCellStyle);
        for (const _prop of _props) {
            let _zStyleSrc: string = pCellStyle[_prop],
                _zStyleDes: string = this[_prop];
            switch (StyleElementFlags[_prop]) {
                case StyleElementFlags.Font: {
                    let _fontSrc = _zStyleSrc.split(','),
                        _fontDes = _zStyleDes ? _zStyleDes.split(',') : new Array(_fontSrc.length);

                    for (let _n = 0; _n < _fontSrc.length; _n++) {
                        if (_fontSrc[_n] != _fontDes[_n] && _fontSrc[_n])
                            _fontDes[_n] = _fontSrc[_n];
                    }

                    this[_prop] = _fontDes.join(',');

                    break;
                }
                default: {
                    if (_zStyleSrc != _zStyleDes) {
                        this[_prop] = _zStyleSrc;
                    }
                }
            }
        }
    }

    private getElement(e: StyleElementFlags): string {
        let _zKey = StyleElementFlags[e],
            _zValue = this[_zKey];

        return !String.isNullOrEmpty(_zValue) ? String.format('{0}:{1};', _zKey, _zValue) : '';
    }
}

export class BravoCellFactory extends wjg.CellFactory {
    static GroupInColumnStyle = 'bravo-group-in-column';

    private _cache = {};

    public updateCell(panel: wjg.GridPanel, row: number, col: number, cell: HTMLElement, rng?: wjg.CellRange, updateContent?: boolean) {
        let _grd = <BravoWebGrid>panel.grid,
            _row = <wjg.Row>panel.rows[row],
            _col = <wjg.Column>panel.columns[col],
            _gr = _row instanceof wjg.GroupRow ? _row : null,
            _ct = panel.cellType,
            _bIsUnbound = _grd.itemsSource == null,
            _className = null,
            _cellData: any,
            _nIndent: number = 0,
            _cs: CellStyle = null,
            _css: any = {},
            _pR: number = 0, _pL: number = 0;

        let _bIsColGroupCell = _grd.bGroupInColumn && _grd.groups.count > 0 &&
            !String.isNullOrEmpty(_col.name) && _grd.groups.containsKey(_col.name);

        let _bIsTreeNodeCell = !_bIsColGroupCell && _ct == wjg.CellType.Cell && _gr != null &&
            _gr.hasChildren && _gr.level >= 0 && col == _grd.nTreeColumnPos;

        let _bIsGrandTotalCell = _grd.bAllowGrandTotal && _row.cssClass &&
            _row.cssClass.includes('bravo-grandtotal');

        if (_bIsColGroupCell && _gr != null && _gr.level == 0 && !_gr.isCollapsed)
            _grd.toggleRowVisibility(_gr, false);

        super.updateCell(panel, row, col, cell, rng, updateContent);

        if (_grd.bDrawContentBorders) {
            let _border = String.format('{0}px solid {1}', BravoSettings.toCurrentDpiXWithBorder(1), '#bbb');//_grd.contentBorderColor.toString());

            let _nTopRow = row,
                _nBottomRow = row,
                _nLeftCol = col,
                _nRightCol = col;

            if (rng != null && !rng.isSingleCell) {
                _nTopRow = rng.row;
                _nBottomRow = rng.row2;
                _nLeftCol = rng.col;
                _nRightCol = rng.col2;
            }

            switch (_ct) {
                case wjg.CellType.ColumnHeader:
                    if (_nLeftCol == 0) _css.borderLeft = _border;
                    if (_nTopRow == 0) _css.borderTop = _border;

                    if (_nRightCol == panel.columns.length - 1)
                        _css.borderRight = _border;

                    if (_nBottomRow == panel.rows.length - 1 && _grd.cells.rows.length == 0)
                        _css.borderBottom = _border;

                    break;
                case wjg.CellType.Cell:
                    if (_nLeftCol == 0) _css.borderLeft = _border;

                    if (_nRightCol == panel.columns.length - 1)
                        _css.borderRight = _border;

                    if (_nTopRow == 0 && _grd.columnHeaders.rows.length == 0)
                        _css.borderTop = _border;

                    if (_nBottomRow == panel.rows.length - 1 && _grd.columnFooters.rows.length == 0)
                        _css.borderBottom = _border;

                    break;
                case wjg.CellType.ColumnFooter:
                    if (_nLeftCol == 0) _css.borderLeft = _border;

                    if (_nRightCol == panel.columns.length - 1)
                        _css.borderRight = _border;

                    break;
            }
        }

        if (updateContent != false) {
            _cellData = panel.getCellData(row, col, true);
            BravoWebGrid.formatAutoTextCell(panel, row, col, cell, rng, _cellData);
        }

        if (_bIsColGroupCell) {
            let _zStyleName = GroupInColumnStyle + "_" + panel.columns[col].name;

            _cs = _grd.styles.containsKey(_zStyleName) ? _grd.styles.get(_zStyleName) :
                _grd.styles.containsKey(CellStyleEnum.Subtotal0) ? _grd.styles.get(CellStyleEnum.Subtotal0).value : null;

            if (_cs != null) {
                let textAlignProp = StyleElementFlags[StyleElementFlags.TextAlign],
                    _zTextAlign: string = _cs[textAlignProp];

                if (!String.isNullOrEmpty(_zTextAlign) && _zTextAlign.startsWith("Right"))
                    _cs[textAlignProp] = "RightCenter";
                else if (!String.isNullOrEmpty(_zTextAlign) && _zTextAlign.startsWith("Center"))
                    _cs[textAlignProp] = "CenterCenter";
                else
                    _cs[textAlignProp] = "LeftCenter";

                if (_col.dataType == wjc.DataType.String)
                    _cs["WordWrap"] = true;

                _grd.addStyle(_zStyleName, _cs);
                _className += " " + _zStyleName;
            }
        }

        switch (_ct) {
            case wjg.CellType.Cell:
                if (updateContent != false) {
                    if (!_bIsUnbound) {
                        let _nFirstVisible = panel.columns.firstVisibleIndex;
                        if (col == _nFirstVisible && col != _grd.nTreeColumnPos && _gr != null && _bIsTreeNodeCell)
                            cell.textContent = _cellData;
                        else if (col == _nFirstVisible && !_bIsTreeNodeCell)
                            cell.textContent = _cellData;

                        if (col == _grd.nTreeColumnPos && !_grd.bGroupInColumn) {
                            _nIndent = _grd.getCellIndent(row, col);
                            _className += ' ' + _col.cssClass;

                            _cs = _grd.styles.getValue(CellStyleEnum.Normal);
                            let _css1 = CellStyle.buildCss(_cs, StyleElementFlags.Margins);

                            if (_nIndent > 0) {
                                if (_grd.rightToLeft) {
                                    _pR = BravoCore.convertPxStringToNumber(_css1['padding-right']) || 0;
                                    _css.paddingRight = String.format("{0}px", _nIndent + _pR);
                                }
                                else {
                                    _pL = BravoCore.convertPxStringToNumber(_css1['padding-left']) || 0;
                                    _css.paddingLeft = String.format("{0}px", _nIndent + _pL);
                                }
                            }
                        }

                        if (_gr != null && col == _grd.nTreeColumnPos && !_grd.isTreeNodeMode() && !cell.classList.contains('bravo-grandtotal'))
                            BravoCore.append(cell, this._getTreeIcon(_gr) + BravoWebGrid.getGroupHeader(_gr));

                        if (_bIsTreeNodeCell && !_grd.isHiddenRow(row) && _grd.isTreeNodeMode()) {
                            let _nChildCount = this.childCount(_gr);
                            if (_nChildCount > 0)
                                _cellData = cell.textContent + String.format(" ({0})", _nChildCount);
                            else
                                _cellData = cell.textContent;

                            BravoCore.append(cell, this._getTreeIcon(_gr) + _cellData);
                        }
                    }

                    if (_bIsColGroupCell && col == _grd.nTreeColumnPos && _gr == null) {
                        let _parentRow: wjg.GroupRow = _grd.getParentNode(_row);
                        if (_parentRow instanceof wjg.GroupRow && _parentRow.hasChildren) {
                            BravoCore.append(cell, this._getTreeIcon(_parentRow) + '&nbsp;' + wjc.escapeHtml(cell.textContent));
                            _css.padding = '0';
                            _className += " " + BravoCellFactory.GroupInColumnStyle;
                        }
                    }

                    if (_bIsGrandTotalCell && col == panel.columns.firstVisibleIndex && col != _grd.nTreeColumnPos)
                        cell.textContent = null;
                }
                break;
            case wjg.CellType.RowHeader:
                if (updateContent != false) {
                    let _zAutoHeaderNumberingText: string = null;
                    if (col == 0 && _grd.rowHeaderNumbering != RowHeaderNumberingEnum.None) {
                        if (String.isNullOrEmpty(cell.textContent)) {
                            if (_grd.rowHeaderNumbering == RowHeaderNumberingEnum.DataOnly || _grd.isTreeNodeMode() ||
                                (_grd.groups.count > 0 && _grd.bGroupInColumn)) {
                                let _nDataIndex = _grd.getDataIndex(row);
                                if (_nDataIndex >= 0)
                                    _zAutoHeaderNumberingText = cell.textContent = `${_nDataIndex + 1}`;
                            }
                            else {
                                _zAutoHeaderNumberingText = cell.textContent = `${row + 1}`;
                            }
                        }

                        if (String.isNullOrEmpty(_zAutoHeaderNumberingText))
                            _zAutoHeaderNumberingText = String.format("{0}", row + 1);

                        if (_grd.bHeaderNumberingAutoSize && row == panel.viewRange.bottomRow - 1 && _zAutoHeaderNumberingText) {
                            let _nFontSize = BravoCore.convertPxStringToNumber(cell.style.fontSize) || 11;
                            let _zFontName = cell.style.fontFamily;

                            let _s = BravoGraphicsRenderer.measureString(_zAutoHeaderNumberingText,
                                new Font(_zFontName, pxToPt(_nFontSize))),
                                _nNeedWidth = Math.max(_s.width + 3, 14);

                            if (_col.width != _nNeedWidth) {
                                _col.width = _nNeedWidth;
                                _grd.raiseOnContentWidthChanged(new RowColEventArgs(panel, -1, col));
                            }
                        }
                    }
                }

                break;
            case wjg.CellType.ColumnHeader:
                let _bndCol = _grd._getBindingColumn(panel, row, _col);
                if (updateContent != false) {
                    let _r2 = row;
                    if (rng && !rng.isSingleCell)
                        _r2 = rng.row2;

                    if (_bndCol.currentSort && _grd.showSort && (_r2 == _grd._getSortRowIndex() || _bndCol != _col))
                        BravoCore.append(cell, wjc.escapeHtml(_cellData) + this._getSortIcon0(_col));
                }

                break;
        }

        /* if (_bIsTreeNodeCell && _grd.countGroupChilds != GridCountGroupChildEnum.Hide) {
            let _nChildCount = 0;
            if (_grd.countGroupChilds == GridCountGroupChildEnum.GroupOnly) {

            }
            else
        } */

        if (!String.isNullOrEmpty(_className))
            cell.className += ' ' + _className;

        let _css0 = {};
        if ((_ct != wjg.CellType.ColumnHeader && _grd.autoTextMode == GridAutoTextContentEnum.NonFixed) ||
            (_ct == wjg.CellType.ColumnHeader && _grd.autoTextMode == GridAutoTextContentEnum.Fixed)) {
            _cs = BravoWebGrid.getCellStyle(panel, row, col);
            _css0 = CellStyle.buildCss(_cs);

            this.renderSpecialCell(panel, row, col, cell, _cs);
        }

        if (_ct == wjg.CellType.Cell && _grd.bExistsColumnWordWrap && col == _grd.nTreeColumnPos && !_grd.bGroupInColumn) {
            if (_row.height == null && _grd.autoFitRowHeight == GridAutoFitRowHeightEnum.NonFixed) {
                this.fitRowHeight(panel, row, 0, panel.columns.length - 1, _cs, rng, _nIndent + _pL + _pR);
                if (panel.rows[row].height != null || panel.rows[row].height != _grd.rows.defaultSize)
                    _grd.raiseOnContentHeightChanged(new RowColEventArgs(panel, row, col));
            }
        }

        let _cssAll = { ..._css0, ..._css };
        let _style = cell.style;

        for (let _key in _cssAll)
            _style[_key] = _cssAll[_key];
    }

    private _barCodeCtrl: IBravoBarCode = null;

    protected renderSpecialCell(panel: GridPanel, row: number, col: number, cell: HTMLElement, cellStyle?: CellStyle) {
        let _cellType = this.getCellType(panel, row, col, cellStyle);
        if (_cellType != GridCellTypeEnum.barcode &&
            _cellType != GridCellTypeEnum.qrcode &&
            _cellType != GridCellTypeEnum.rtf &&
            _cellType != GridCellTypeEnum.html &&
            _cellType != GridCellTypeEnum.img)
            return false;

        try {
            switch (_cellType) {
                case GridCellTypeEnum.img:
                    let _zBuff = cell.textContent;
                    let _eImage = ExtensionsMethod.renderImage(null, "jpeg", _zBuff);

                    if (_eImage)
                        cell.innerHTML = _eImage.outerHTML;

                    return false;

                case GridCellTypeEnum.qrcode:
                case GridCellTypeEnum.barcode:
                    let _zOrgText = cell.textContent;
                    cell.textContent = String.empty;

                    if (String.isNullOrEmpty(_zOrgText))
                        return false;

                    if (this._barCodeCtrl == null)
                        // this._barCodeCtrl = new BravoBarCode();

                        if (_cellType == GridCellTypeEnum.qrcode) {
                            this._barCodeCtrl.barCodeType = BarCodeTypeEnum.QRCode;
                        }
                        else {
                            let _zFormat = wjc.asString(cellStyle['Format']);
                            if (!String.isNullOrEmpty(_zFormat) &&
                                _zFormat.toLowerCase().startsWith(GridCellTypeEnum[GridCellTypeEnum.barcode] + '.')) {
                                let _codeType = BarCodeTypeEnum[_zFormat.split('.')[1]];
                                if (_codeType != null)
                                    this._barCodeCtrl.barCodeType = _codeType;
                            }
                        }

                    this._barCodeCtrl.codeValue = _zOrgText;
                    this._barCodeCtrl.autoScale = true;
                    this._barCodeCtrl.showLabelText = true;
                    this._barCodeCtrl.height = cell.offsetHeight - 10;
                    this._barCodeCtrl.width = this._barCodeCtrl.height * 3;

                    let _img = this._barCodeCtrl.getImage();
                    if (_img == null) return false;

                    cell.appendChild(_img);

                    return false;

                case GridCellTypeEnum.rtf:
                    if (!ExtensionsMethod.isRtfString(cell.textContent))
                        return;

                    cell.innerHTML = ExtensionsMethod.rftToHtml(cell.textContent).trimChars('"');
                    cell.classList.add('cell-rtf');

                    return true;
                case GridCellTypeEnum.html:
                    if (cell.textContent)
                        cell.innerHTML = cell.textContent;

                    return true;
            }
        }
        catch (_ex) {
            console.log(_ex);
            return false;
        }
    }

    public getCellType(panel: GridPanel, row: number, col: number, cellStyle?: CellStyle): GridCellTypeEnum {
        if (!isCellValid(panel, row, col)) return GridCellTypeEnum.None;

        let _bIsFixed = panel.cellType == wjg.CellType.ColumnHeader;
        let _colType = getCellType(panel.columns[col][StyleProp]);

        let _cst = cellStyle != null ? cellStyle : BravoWebGrid.getCellStyle(panel, row, col);
        let _cellType = getCellType(_cst);

        if ((!_bIsFixed && _colType == GridCellTypeEnum.Check) || _cellType == GridCellTypeEnum.Check)
            return GridCellTypeEnum.Check;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.img) || _cellType == GridCellTypeEnum.img)
            return GridCellTypeEnum.img;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.link) || _cellType == GridCellTypeEnum.link)
            return GridCellTypeEnum.link;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.rtf) || _cellType == GridCellTypeEnum.rtf)
            return GridCellTypeEnum.rtf;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.html) || _cellType == GridCellTypeEnum.html)
            return GridCellTypeEnum.html;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.barcode) || _cellType == GridCellTypeEnum.barcode)
            return GridCellTypeEnum.barcode;

        if ((!_bIsFixed && _colType == GridCellTypeEnum.qrcode) || _cellType == GridCellTypeEnum.qrcode)
            return GridCellTypeEnum.qrcode;

        return GridCellTypeEnum.Normal;
    }

    private fitRowHeight(pPanel: wjg.GridPanel, pnRow: number, pnFromCol: number, pnToCol: number, pCellStyle: CellStyle,
        pRange: wjg.CellRange, pnIndent: any) {
        let _nMinColWidth = 40, _pT = 0, _pB = 0;
        let _g = <BravoWebGrid>pPanel.grid,
            _row = <wjg.Row>pPanel.rows[pnRow];

        if (!_row || !_row.visible) return;

        let _nMax = 0;
        for (let _nCol = pnFromCol; _nCol <= pnToCol; _nCol++) {
            if (!isCellValid(pPanel, pnRow, _nCol)) continue;

            let _col = <wjg.Column>pPanel.columns[_nCol];

            if (!_col || !_col.wordWrap || !_col.visible) continue;

            if (!pRange)
                pRange = _g.getMergedRange(pPanel, pnRow, _nCol);

            let _nWidth = pRange && !pRange.isSingleCell ?
                _g.getCurrentWidthOfCols(pPanel, pRange.col, pRange.col2) : _col.renderSize;

            _nWidth -= pnIndent;

            if (_row instanceof wjg.GroupRow)
                _nWidth -= 14;

            if ((_nWidth < 0 ? pPanel.columns.defaultSize : _nWidth) < _nMinColWidth)
                continue;

            let _zText = pPanel.getCellData(pnRow, _nCol, false);

            if (String.isNullOrEmpty(_zText) && _row instanceof wjg.GroupRow)
                _zText = _row.getGroupHeader();

            if (String.isNullOrEmpty(_zText)) continue;

            if (!pCellStyle || Object.keys(pCellStyle).length < 1)
                pCellStyle = BravoWebGrid.getCellStyle(pPanel, pnRow, _nCol, false);

            let _css1 = CellStyle.buildCss(pCellStyle);
            _pT = BravoCore.convertPxStringToNumber(_css1['padding-top']) || 0;
            _pB = BravoCore.convertPxStringToNumber(_css1['padding-bottom']) || 0;

            let _nFontSize = pxToPt(BravoCore.convertPxStringToNumber(_css1['font-size'])) || _g.font.nSize;
            let _zFontName = _css1['font-family'] || _g.font.FontFamily;
            let _fontStyle = Font.getFontStyle(_css1);

            let _font = new Font(_zFontName, _nFontSize, _fontStyle);

            let _sz = BravoGraphicsRenderer.measureString(_zText.trim(), _font, _nWidth);
            if (!_sz) continue;

            // _sz.height += _pT + _pB;

            // _nMax = Math.max(_nMax, _sz.height);
        }

        _row.height = Math.max(_nMax, pPanel.rows.defaultSize);
    }

    private childCount(pGroupRow: wjg.GroupRow): number {
        let grid = pGroupRow.grid,
            fmt = grid.groupHeaderFormat || wjc.culture.FlexGrid.groupHeaderFormat;

        let _nChildCount = 0;
        if (fmt && grid instanceof BravoWebGrid && grid.countGroupChilds != GridCountGroupChildEnum.Hide) {
            let _range = pGroupRow.getCellRange();
            if (_range && !_range.isSingleCell && _range.topRow < _range.bottomRow) {
                for (let _i = _range.topRow + 1; _i <= _range.bottomRow; _i++) {
                    const _row: wjg.Row = grid.rows[_i];

                    if (grid.isHiddenRow(_i) || !_row || (_row && !_row.visible))
                        continue;

                    if (grid.countGroupChilds == GridCountGroupChildEnum.GroupOnly) {
                        if (_row instanceof wjg.GroupRow && (pGroupRow.level + 1) == _row.level)
                            _nChildCount++;
                    }
                    else {
                        if (_row instanceof wjg.GroupRow && grid.countGroupChilds != GridCountGroupChildEnum.All)
                            continue;

                        _nChildCount++;
                    }
                }
            }
        }

        return _nChildCount;
    }

    private _getTreeIcon(gr: wjg.GroupRow): string {
        let _glyph = gr.isCollapsed ? 'fa fa-plus' : 'fa fa-minus'; //'wj-glyph-right' : 'wj-glyph-down-right';
        let _span = `<span class="${_glyph}"></span>`;

        return `<button class="wj-btn wj-btn-glyph ${wjg.CellFactory._WJC_COLLAPSE}" type = "button" tabindex = "-1">${_span}</button >`
    }

    private _getSortIcon0(col: wjg.Column): string {
        return '<span class="wj-glyph-' + (col.currentSort == '+' ? 'up' : 'down') + '"></span>';
    }
}

export class StyleElementMatch {
    constructor(m: RegExpMatchArray) {
        this._m = m;
    }

    public get element(): StyleElementFlags {
        if (String.isNullOrEmpty(this.zElementName)) return StyleElementFlags.None;
        return StyleElementFlags[this.zElementName];
    }

    public get zElementName(): string {
        if (this._m == null || this._m.groups["name"] == null)
            return String.empty;

        return this._m.groups["name"];
    }

    public get zElementValue(): string {
        if (this._m == null || this._m.groups["value"] == null)
            return String.empty;

        return this._m.groups["value"];
    }

    public get zElementString(): string {
        return this._m ? this._m.input : String.empty;
    }

    public get nStartIndex(): number {
        return this._m ? this._m.index : -1;
    }

    private _m: RegExpMatchArray;

    public get match(): RegExpMatchArray {
        return this._m;
    }
}

export class DynamicStyleItem {
    public zColumnList: string;
    public Name: string;
    public zStyleExpr: string;

    public constructor(pzName: string, pzStyleExpr: string, pzColumnList: string) {
        this.Name = pzName;
        this.zStyleExpr = pzStyleExpr;
        this.zColumnList = pzColumnList;
    }
}

export class RaiseOwnerDrawCellEventArgs extends wjg.FormatItemEventArgs {
    public multilineCellEventArgs: wjg.FormatItemEventArgs = null;

    constructor(panel: GridPanel, range: wjg.CellRange, cell: HTMLElement) {
        super(panel, range, cell);
    }
}

export class CustomOwnerDrawCellEventArgs extends wjg.FormatItemEventArgs {
    public readonly bIsFixedCell: boolean;
    public readonly cellInfo: { cellType: GridCellTypeEnum, cs?: CellStyle };
    public readonly bIsButtonCell: boolean;
    public readonly bIsAddNewRow: boolean;
    public readonly bIsFocusedCell: boolean;
    public readonly bIsHighlightCell: boolean;
    public readonly bIsColGroupCell: boolean;
    public readonly bIsTreeNodeCell: boolean;
    public readonly nCellIndent: number;
    public readonly bIsMultilineCell: boolean;

    constructor(p: GridPanel, rng: wjg.CellRange, cell: HTMLElement,
        pbIsFixedCell: boolean,
        pCellInfo: { cellType: GridCellTypeEnum, cs?: CellStyle },
        pbIsButtonCell: boolean,
        pbIsAddNewRow: boolean,
        pbIsFocusedCell: boolean,
        pbIsHighlightCell: boolean,
        pbIsColGroupCell: boolean,
        pbIsTreeNodeCell: boolean,
        pnCellIndent: number,
        pbIsMultilineCell: boolean) {
        super(p, rng, cell);

        this.bIsFixedCell = pbIsFixedCell;
        this.cellInfo = pCellInfo;
        this.bIsButtonCell = pbIsButtonCell;
        this.bIsAddNewRow = pbIsAddNewRow;
        this.bIsFocusedCell = pbIsFocusedCell;
        this.bIsHighlightCell = pbIsHighlightCell;
        this.bIsColGroupCell = pbIsColGroupCell;
        this.bIsTreeNodeCell = pbIsTreeNodeCell;
        this.nCellIndent = pnCellIndent;
        this.bIsMultilineCell = pbIsMultilineCell;
    }
}

export class RowColEventArgs extends EventArgs {
    public cancel = false;
    public readonly row: number;
    public readonly col: number;
    public readonly panel: GridPanel;

    constructor(panel: GridPanel, row: number, col: number) {
        super();
        this.panel = panel;
        this.row = row;
        this.col = col;
    }
}

enum SortFlags {
    None = 0,
    Ascending = 1,
    Descending = 2,
    AsDisplayed = 4,
    IgnoreCase = 8,
    UseColSort = 16
}

