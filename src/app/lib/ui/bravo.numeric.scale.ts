import * as wjc from "wijmo/wijmo";

export class BravoNumericScale {
    public static getAutoScalingUnit(pNumber: number, pzDisplayFormat: string): NumericScaleUnitEnum {
        let _nScale = 1,
            _values = Object.keys(NumericScaleUnitEnum).filter(k => !wjc.isNumber(k));

        for (let _i = _values.length - 1; _i >= 0; _i--) {
            _nScale = this.getNumericScaleUnitValue(NumericScaleUnitEnum[_values[_i]]);
            if (pzDisplayFormat) {
                let _zNumStr = wjc.Globalize.formatNumber(pNumber / _nScale, pzDisplayFormat);
                let _nIntVal = parseFloat(_zNumStr);

                if (!isNaN(_nIntVal) && _nIntVal > 0)
                    return NumericScaleUnitEnum[_values[_i]];
            }
            else if (Math.floor(pNumber / _nScale) > 0) {
                return NumericScaleUnitEnum[_values[_i]];
            }
        }

        return NumericScaleUnitEnum.None;
    }

    public static getNumericScaleUnitValue(pScaleUnit: NumericScaleUnitEnum): number {
        switch (pScaleUnit) {
            case NumericScaleUnitEnum.Thousand:
                return 1000;
            case NumericScaleUnitEnum.TenThousand:
                return 10000;
            case NumericScaleUnitEnum.HundredThousand:
                return 100000;
            case NumericScaleUnitEnum.Million:
                return 1000000;
            case NumericScaleUnitEnum.TenMillion:
                return 10000000;
            case NumericScaleUnitEnum.HundredMillion:
                return 100000000;
            case NumericScaleUnitEnum.Billion:
                return 1000000000;
            case NumericScaleUnitEnum.TenBillion:
                return 10000000000;
            case NumericScaleUnitEnum.HundredBillion:
                return 100000000000;
            case NumericScaleUnitEnum.Trillion:
                return 1000000000000;
            default:
                return 1;
        }
    }
}

export enum NumericScaleUnitEnum {
    None,
    Thousand,
    TenThousand,
    HundredThousand,
    Million,
    TenMillion,
    HundredMillion,
    Billion,
    TenBillion,
    HundredBillion,
    Trillion,
}