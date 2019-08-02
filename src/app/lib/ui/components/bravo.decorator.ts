import * as wjc from 'wijmo/wijmo';
import "reflect-metadata"

export function DefaultValue(value: any): MethodDecorator {
    return function (target: Function, key: string, descriptor: any) {
        let properties: Array<{ key: string, value: any }> = Reflect.getMetadata("defaultValue", target) || [];
        if (properties.findIndex(p => p.key == key) < 0)
            properties.push({ key: key, value: value });

        Reflect.defineMetadata('defaultValue', properties, target);
    }
}

export function Enum(value: any): MethodDecorator {
    return function (target: Function, key: string, descriptor: any) {
        let properties: Array<{ key: string, value: any }> = Reflect.getMetadata("bravo-enum", target) || [];
        if (properties.findIndex(p => p.key == key) < 0)
            properties.push({ key: key, value: value });

        Reflect.defineMetadata('bravo-enum', properties, target);
    }
}

export function isEnum(pOwner: any, propName: string): boolean {
    let _enums = Reflect.getMetadata('bravo-enum', pOwner);
    if (!wjc.isArray(_enums)) return false;

    for (const _e of _enums) {
        if (_e.key == propName)
            return true;
    }

    return false;
}

export function asEnum(pOwner: any, propName: string, value: any) {
    let _enums = Reflect.getMetadata('bravo-enum', pOwner);
    if (!wjc.isArray(_enums)) return null;

    let _enumType = null;
    for (const _e of _enums) {
        if (_e.key == propName) {
            _enumType = _e.value;
            break;
        }
    }

    if (_enumType == null) return null;

    let e = _enumType[value];
    wjc.assert(e != null, 'Invalid enum value.');

    return Number.isNumber(value) ? value : e;
}

export function shouldSerializeValue(component: any, propName: string) {
    let _metaDefalutValue: Array<any> = Reflect.getMetadata('defaultValue', component);
    if (!wjc.isArray(_metaDefalutValue)) return true;

    let _val = component[propName];
    for (const _m of _metaDefalutValue) {
        if (_m.key == propName) {
            if (_m.value == _val)
                return false;

            return true;
        }
    }

    return true;
}