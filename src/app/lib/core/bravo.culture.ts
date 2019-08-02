import { BravoLangEnum } from "./enums";

// @dynamic

export class BravoCulture {
    public static getLangCollection(): Array<BravoLangEnum> {
        return [
            BravoLangEnum.Vietnamese,
            BravoLangEnum.English,
            BravoLangEnum.Japanese,
            // BravoLangEnum.Chinese,
            // BravoLangEnum.Korean,
            // BravoLangEnum.Custom
        ]
    }

    private static _ci = 'en-US';

    public static get ci(): string {
        return this._ci;
    }

}