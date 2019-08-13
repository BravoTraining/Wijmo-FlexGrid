import { TranslateService } from '@ngx-translate/core';
import { BravoSettings } from './bravo.settings';
import { Observable } from 'rxjs';

export class BravoResourceManager {
    public static get current(): TranslateService {
        if (BravoSettings.current.resources instanceof TranslateService)
            return BravoSettings.current.resources;
    }

    public static getString(pString: string, interpolateParams?: Object) {
        if (this.current == null)
            return new Observable(observer => {
                observer.next(pString);
                observer.complete();
            });

        return this.current.get(pString, interpolateParams);
    }
}