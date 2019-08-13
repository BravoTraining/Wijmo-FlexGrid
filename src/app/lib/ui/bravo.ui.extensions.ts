import * as wjc from "wijmo/wijmo";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef } from "@angular/core";
import { BravoSettings } from './bravo.settings';
import { GridCellTypeEnum } from './enums';
import { CellStyle } from './controls/bravo.web.grid';
import { BravoCore } from '../core/core';

export function MakeProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

export function pxToPt(val: number) {
    return (val * 72) / BravoSettings.BaseDpi.x;
}

export function measureText(pzText: string, pnWidth: number, pCell: HTMLElement, cache?: any): { width: number, height: number } {
    if (!BravoCore.isDefined(pzText)) return { width: 0, height: 0 };
    let _style = getComputedStyle(pCell);

    let _str = pzText.length + ':' + pnWidth + ':' + _style.fontWeight + ':' +
        _style.fontFamily + ':' + _style.fontSize;

    if (wjc.isObject(cache) && cache[_str])
        return cache[_str];

    let _eMeasure = document.createElement('div');
    _eMeasure.innerHTML = pzText;
    _eMeasure.style.visibility = 'hidden';

    if (pnWidth) {
        _eMeasure.style.width = pnWidth + 'px';
        _eMeasure.style.textOverflow = 'clip';
    }
    else {
        _eMeasure.style.paddingRight = _style.paddingRight;
        _eMeasure.style.paddingLeft = _style.paddingLeft;

        _eMeasure.style.fontFamily = _style.fontFamily;
        _eMeasure.style.fontWeight = _style.fontWeight;
        _eMeasure.style.fontSize = _style.fontSize;

        _eMeasure.style.borderRightWidth = _style.borderRightWidth;
        _eMeasure.style.borderRightStyle = _style.borderRightStyle;
        _eMeasure.style.borderRightColor = _style.borderRightColor;
    }

    _eMeasure.style.paddingTop = _style.paddingTop;
    _eMeasure.style.paddingBottom = _style.paddingBottom;

    _eMeasure.style.borderBottomWidth = _style.borderBottomWidth;
    _eMeasure.style.borderBottomStyle = _style.borderBottomStyle;
    _eMeasure.style.borderBottomColor = _style.borderBottomColor;

    _eMeasure.style.cssFloat = 'left';

    document.body.appendChild(_eMeasure);

    let _size = {
        width: _eMeasure.offsetWidth,
        height: _eMeasure.offsetHeight
    };

    document.body.removeChild(_eMeasure);

    if (typeof (cache) != 'object')
        cache = {};

    cache[_str] = _size;

    return _size;
}

export function getCellType(style: CellStyle): GridCellTypeEnum {
    if (style == null || String.isNullOrEmpty(style["Format"]))
        return GridCellTypeEnum.Normal;

    let _zFormat: string = style["Format"];

    if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.img]) == 0)
        return GridCellTypeEnum.img;

    if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.rtf]) == 0)
        return GridCellTypeEnum.rtf;

    if (String.compare(_zFormat, GridCellTypeEnum[GridCellTypeEnum.html]) == 0)
        return GridCellTypeEnum.html;

    if (_zFormat.startsWith(GridCellTypeEnum[GridCellTypeEnum.barcode]))
        return GridCellTypeEnum.barcode;

    if (_zFormat.startsWith(GridCellTypeEnum[GridCellTypeEnum.qrcode]))
        return GridCellTypeEnum.qrcode;

    if (_zFormat.startsWith(GridCellTypeEnum[GridCellTypeEnum.progress]))
        return GridCellTypeEnum.progress;

    if (_zFormat.startsWith(GridCellTypeEnum[GridCellTypeEnum.link]))
        return GridCellTypeEnum.link;

    return GridCellTypeEnum.Normal;
}