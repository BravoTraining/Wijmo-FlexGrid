import { BravoLangEnum } from "./enums";
import { BravoCulture } from "./bravo.culture";

export const CurrentLanguage = "CurrentLanguage";

// @dynamic

export class BravoClientSettings {
    // private static _currentLang: BravoLangEnum = BravoLangEnum.Vietnamese;

    public static get currentLang(): BravoLangEnum {
        let _currentLang = localStorage.getItem(CurrentLanguage);
        return BravoLangEnum[_currentLang] ? <BravoLangEnum>Number.asNumber(_currentLang) : null;
    }

    public static set currentLang(value: BravoLangEnum) {
        let _zLang = localStorage.getItem(CurrentLanguage);
        let _lang = BravoLangEnum[_zLang] ? <BravoLangEnum>Number.asNumber(_zLang) : null;

        if (_lang == value) return;

        localStorage.setItem('CurrentLanguage', value.toString());
        this._nCurrentLangId = BravoCulture.getLangCollection().findIndex(x => x == value);
    }

    public static get zCurrentLang(): string {
        return BravoLangEnum[this.currentLang];
    }

    private static _nCurrentLangId = 0;

    public static get nCurrentLangId(): number {
        return this._nCurrentLangId;
    }

    private static _zUserName: string;

    public static get zUserName(): string {
        if (!this._zUserName) {
            let _zSystemProperties = localStorage.getItem('SystemProperties');
            if (_zSystemProperties) {
                let systemProperties = JSON.parse(_zSystemProperties);
                if (systemProperties instanceof Array) {
                    let _user = systemProperties.find(it => it['PropertyName'] == 'B00UserList.UserName');
                    this._zUserName = _user ? _user['PropertyValue'] : String.empty;
                }
            }
        }

        return this._zUserName;
    }

    public static set zUserName(value: string) {
        this._zUserName = value;
    }
}