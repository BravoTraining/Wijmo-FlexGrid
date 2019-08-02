import { TypeCode } from "./data/enums";
import * as wjc from "wijmo/wijmo";
import { SensitivityEnum } from "./extensions.method";
import { Dictionary } from "./data/bravo.web.dictionary";

export function assert(condition: boolean, msg: string) {
    if (!condition) {
        throw '** Assertion failed in Bravo: ' + msg;
    }
}

export function isString(value: any): boolean {
    return typeof (value) === 'string';
}

export function isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

export function isNumericValue(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

export function isIntegerType(value: any): boolean {
    return !isNaN(parseInt(value)) && isFinite(value);
}

export function isObject(value: any): boolean {
    return value != null && typeof (value) === 'object' && !isDate(value);
}

export function isDate(value: any): boolean {
    return value instanceof Date && !isDate(value.getTime());
}

export function getType(value): TypeCode {
    if (isString(value)) return TypeCode.String;
    if (isIntegerType(value)) return TypeCode.Int32;
    if (isNumericValue(value)) return TypeCode.Decimal;
    if (isDate(value)) return TypeCode.DateTime;
    if (isArray(value)) return TypeCode.ByteArray;

    return TypeCode.Object;
}

export function convertTypeCodeToDataType(type: TypeCode) {
    switch (type) {
        case TypeCode.String:
            return wjc.DataType.String;
        case TypeCode.Int16: case TypeCode.Int32: case TypeCode.Int64: case TypeCode.Double: case TypeCode.Decimal:
        case TypeCode.UInt16: case TypeCode.UInt32: case TypeCode.UInt64: case TypeCode.Byte:
            return wjc.DataType.Number;
        case TypeCode.DateTime:
            return wjc.DataType.Date;
        case TypeCode.Boolean:
            return wjc.DataType.Boolean;
        case TypeCode.ByteArray: case TypeCode.SByte:
            return wjc.DataType.Array;
        case TypeCode.Object:
            return wjc.DataType.Object;
    }
}

export function isBoolean(value: any): boolean {
    return typeof (value) === 'boolean';
}

export function isArray(value: any): boolean {
    return value instanceof Array || // doesn't work on different windows
        Array.isArray(value) || // doesn't work on derived classes
        Object.prototype.toString.call(value) === '[object Array]'; // always works
}

export function isFunction(value: string): boolean {
    return typeof (value) === 'function';
}

export function asFunction(value: any, nullOK = true): Function {
    assert((nullOK && value == null) || isFunction(value), 'Function expected.');
    return value;
}

export function sameContent(dst: any, src: any) {
    for (const key in src) {
        if (dst && !sameValue(dst[key], src[key])) {
            return { flag: false, key: key, value: dst[key] };
        }
    }

    for (const key in dst) {
        if (src && !sameValue(dst[key], src[key])) {
            return { flag: false, key: key, value: dst[key] };
        }
    }

    return { flag: true, key: undefined, value: undefined };
}

export function sameValue(v1: any, v2: any) {
    return v1 == v2 || wjc.DateTime.equals(v1, v2);
}

export function reviver(key, value): any {
    try {
        if (Date.isDate(value))
            return Date.asDate(value);

        return value;
    }
    catch{
        return value;
    }
}

export class BravoDataTypeConverter {
    public static convertValue(value: any, type: TypeCode) {
        if (value == null || value == undefined)
            return value;

        if (type == TypeCode.Boolean) {
            return (value === 'True' || value === true) ? true : false;
        }

        if (type == TypeCode.DateTime) {
            if (Date.isDate(value))
                return Date.asDate(value);

            if (wjc.isString(value))
                return wjc.Globalize.parseDate(value, Date.defaultFormat);
        }

        if (this.isNumericType(type) && Number.isNumber(value))
            return Number.asNumber(value);

        if (type != TypeCode.String) {
            if (value instanceof Array)
                return value;

            if (value instanceof Dictionary)
                return value;
        }

        return `${value}`;
    }

    public static compareValue(val1: any, val2: any, type: TypeCode, pbIgnoreCaseString: boolean = false) {
        if (!val1 && !val2) return true;

        if (type == TypeCode.String) {
            if (String.compare(`${val1}`.trimEnd(), `${val2}`.trimEnd(),
                pbIgnoreCaseString ? SensitivityEnum.Variant : SensitivityEnum.Base) == 0)
                return true;
        }

        if (this.isNumericType(type)) {
            if (val1 != null && val1 != undefined &&
                val2 != null && val2 != undefined) {
                return Number.asNumber(val1) == Number.asNumber(val2);
            }

            if ((val1 == null || val1 == undefined) && Number.asNumber(val2) == 0)
                return true;

            if ((val2 == null || val2 == undefined) && Number.asNumber(val1) == 0)
                return true;
        }

        if (type == TypeCode.DateTime && val1 != null && val1 != undefined &&
            val2 != null && val2 != undefined)
            return Date.asDate(val1).getTime() == Date.asDate(val2).getTime();

        if (val1 instanceof Array && val2 instanceof Array) {
            if (val1.length != val2.length) return false;

            for (let _i = 0; _i < val1.length; _i++)
                if (!this.compareValue(val1[_i], val2[_i], type, pbIgnoreCaseString))
                    return false;

            return true;
        }

        if (val1 instanceof Dictionary && val2 instanceof Dictionary) {
            if (val1.count != val2.count) return false;

            for (let _e of val1.values)
                if (!val2.containsKey(_e.key) || !this.compareValue(_e.value, val2.getValue(_e.key), type, pbIgnoreCaseString))
                    return false;

            return true;
        }

        return val1 === val2;
    }

    public static isNumericType(type: TypeCode) {
        return (type == TypeCode.Byte ||
            type == TypeCode.Decimal ||
            type == TypeCode.Double ||
            type == TypeCode.Int16 ||
            type == TypeCode.Int32 ||
            type == TypeCode.Int64 ||
            type == TypeCode.SByte ||
            type == TypeCode.Single ||
            type == TypeCode.UInt16 ||
            type == TypeCode.UInt32 ||
            type == TypeCode.UInt64);
    }
}