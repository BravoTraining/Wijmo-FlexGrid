import { WebTable } from '../data/bravo.web.datatable';
import { Dictionary } from '../data/bravo.web.dictionary';

export interface IWebSet {
    tables: Array<WebTable>;
    extendedProperties: Dictionary<string, any>;
    writeJson(pbFormat: boolean);
    writeXml();
}