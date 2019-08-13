import * as wjc from "wijmo/wijmo";
import * as wjg from "wijmo/wijmo.grid";
import { Padding, BravoCore, Image } from '../../core/core';
import { CellStyle } from '../controls/bravo.web.grid';
import { StyleElementFlags, GridCellTypeEnum } from '../enums';
import { getCellType } from '../bravo.ui.extensions';

export class GridCellInfo {
    public readonly row: number;
    public readonly col: number;
    public readonly actualCol: number;

    constructor(chart: any)
    constructor(row: number, col: number)
    constructor(row: number, col: number, actualCol?: number)
    constructor(row?: number, col?: number, actualCol?: number) {
        if (!Number.isNumber(row)) {
            this.chart = <any>row;
            this.zText = String.empty;
            this.image = null;
            this.col = -1;
            this.row = -1;
        }
        else {
            this.row = row;
            this.col = col;
            this.actualCol = actualCol || this.col;
        }
    }

    public chart: wjc.Control = null;

    public zText: string;

    public get margins(): Padding {
        return new Padding(
            BravoCore.convertPxStringToNumber(this.styleCss['padding-left']),
            BravoCore.convertPxStringToNumber(this.styleCss['padding-top']),
            BravoCore.convertPxStringToNumber(this.styleCss['padding-right']),
            BravoCore.convertPxStringToNumber(this.styleCss['padding-bottom'])
        )
    }

    public zRawText: string;

    public range: wjg.CellRange;

    public style: CellStyle;

    public styleCss: CSSStyleDeclaration;

    public image: Image;

    public bounds: wjc.Rect;

    public bIsDrawn: boolean = false;

    public bIgnoreRender: boolean = false;

    public nIndent: number = 0;

    public nFitHeight: number = 0;

    public cellElement: HTMLElement = null;

    public get cellType(): GridCellTypeEnum {
        if (this.style == null || this.style[StyleElementFlags[StyleElementFlags.Format]] == null)
            return GridCellTypeEnum.Normal;

        return getCellType(this.style);
    }
}