import * as wjc from "wijmo/wijmo";
import { WebTable } from './bravo.web.datatable';
import { BravoExpressionEvaluator } from '../expression/bravo.expression.evaluator';
import { WebDataColumn } from './bravo.web.datacolumn';
import { TypeCode } from './enums';
import { WebSet } from './bravo.web.dataset';
import { BravoCulture } from '../bravo.culture';
import { IWebSet } from '../interface/IWebSet';

export class BravoXmlHelper {

    private static removeFirstLine(pzStr: string): string {
        let _lines = pzStr.split("\n");

        let _sb = new StringBuilder();
        for (let _i = 1; _i < _lines.length; _i++)
            _sb.appendLine("\t" + _lines[_i]);

        return _sb.toString();
    }

    public static writeDataSet(pDataSet: IWebSet, pTables: string[] = null,
        pColumns: string[] = null, pbUseTableAlias: boolean = false,
        pType: BravoXmlStringTypeEnum = BravoXmlStringTypeEnum.ElementMappingWithSchema, pFormat: any = null): string {
        if (pDataSet == null)
            throw new Error("pDataSet");

        let _zDataSetName = 'NewDataSet';

        if (pFormat == null) pFormat = BravoCulture.ci;

        let _sbXml = new StringBuilder();
        _sbXml.appendLine('<?xml version="1.0" standalone="yes"?>');
        _sbXml.appendLine(String.format("<{0}>", _zDataSetName));

        if (pType == BravoXmlStringTypeEnum.ElementMappingWithSchema) {
            let _ds = pDataSet;
            for (let _tb of _ds.tables) {
                if (_tb instanceof WebTable) {
                    if (pbUseTableAlias) {
                        let _zAlias = BravoExpressionEvaluator.getAliasName(_tb);
                        if (String.compare(_tb.name, _zAlias) != 0)
                            _tb.name = _zAlias;
                    }
                    for (let _col of _tb.columns) {
                        if (_col instanceof WebDataColumn) {
                            if (_col.dataType == TypeCode.DateTime)
                                _col.dataType = TypeCode.String;
                        }
                    }
                }


            }

            let _sbSchema = new StringBuilder();
            let _sw = new StringWriter(_sbSchema, pFormat)
            BravoXmlHelper.writeXmlSchema(_ds, _sw)

            // _sw.close();
            _sbXml.append(_sbSchema.toString());


        }

        for (let _tb of pDataSet.tables) {
            if (pTables != null) {
                if (_tb instanceof WebTable) {
                    if (pTables.indexOf(_tb.name) < 0 && pTables.indexOf(BravoExpressionEvaluator.getAliasName(_tb)) < 0)
                        continue;
                }
            }
            _sbXml.append(BravoXmlHelper.writeDataTable(_tb, pColumns, pbUseTableAlias, pType, pFormat));

        }

        _sbXml.append(String.format("</{0}>", _zDataSetName));

        return _sbXml.toString();
    }

    static readonly _invalidXMLCharsRegex: RegExp = new RegExp("[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFD\uFFFE\uFFFF]");

    public static writeDataTable(pTable: WebTable, pColumns: string[],
        pbUseTableAlias: boolean, pType: BravoXmlStringTypeEnum, pFormat: any): string {

        if (pTable == null) throw new Error("pTable");

        let _drs = pTable.rows;
        //console.log(_drs);

        let _sb = new StringBuilder();
        let _columnsName = new Array<string>();

        // let _sw = new StringWriter(_sb, pFormat);

        // BravoXmlHelper.writeXmlSchema(pTable,_sw);

        // console.log(_sw);


        // let _doc = new XMLDocument();
        // console.log(_doc);
        // _doc.append(_sb.toString());
        // console.log(_doc);
        // if(_doc.childNodes.length > 0){
        //     let _xmlNode = _doc.childNodes[0];
        //     while(_xmlNode !=null && !_xmlNode.nodeName.includes("xs:sequence") && _xmlNode.childNodes.length>0)
        //         _xmlNode = _doc.childNodes[0];

        //     if(_xmlNode!=null)

        //         for(let _node in _xmlNode){

        //             // if (_node.attributes["name"] != null && !string.IsNullOrEmpty(_node.Attributes["name"].Value))
        //             //         _columnsName.Add(_node.Attributes["name"].Value);
        //         }
        // }

        // _sb.clear()



        let _zTbName = pbUseTableAlias ? BravoExpressionEvaluator.getAliasName(pTable) : pTable.name;

        for (let _i = 0; _i < _drs.length; _i++) {
            _sb.append("\t<");
            _sb.append(_zTbName);
            if (pType != BravoXmlStringTypeEnum.AttributeMapping)
                _sb.appendLine(">");

            for (let _nCol = 0; _nCol < pTable.columns.length; _nCol++) {
                if (pColumns != null && pColumns.indexOf(pTable.columns[_nCol].columnName) < 0)
                    continue;

                let _val = _drs[_i].currentItems[_nCol];

                if (_val != null) {
                    let _type = pTable.columns[_nCol].dataType;
                    let _zVal: string = null;

                    if (wjc.isString(_type))
                        _zVal = escape(_val.toString()).replace(this._invalidXMLCharsRegex, "");
                    else if (wjc.isDate(_type))
                        _zVal = String.format("{0:yyyy/MM/dd HH:mm:ss}", _val);
                    // else if (_type == typeof(byte[]))
                    //     _zVal = Convert.ToBase64String((byte[])_val);
                    else if (wjc.isBoolean(_type))
                        _zVal = _val.toString();
                    // else if (_type == typeof(byte))
                    //     _zVal = XmlConvert.ToString((byte)_val);
                    // else if (_type == typeof(char))
                    //     _zVal = XmlConvert.ToString((char)_val);
                    // else if (_type == typeof(decimal))
                    //     _zVal = XmlConvert.ToString((decimal)_val);
                    // else if (_type == typeof(double))
                    //     _zVal = XmlConvert.ToString((double)_val);
                    // else if (_type == typeof(float))
                    //     _zVal = XmlConvert.ToString((float)_val);
                    // else if (_type == typeof(int))
                    //     _zVal = XmlConvert.ToString((int)_val);
                    // else if (_type == typeof(long))
                    //     _zVal = XmlConvert.ToString((long)_val);
                    // else if (_type == typeof(sbyte))
                    //     _zVal = XmlConvert.ToString((sbyte)_val);
                    // else if (_type == typeof(ushort))
                    //     _zVal = XmlConvert.ToString((ushort)_val);
                    // else if (_type == typeof(ulong))
                    //     _zVal = XmlConvert.ToString((ulong)_val);
                    else
                        _zVal = String.format("{0}", _val.toString());

                    let _zColName = _columnsName.length > 0 ? _columnsName[_nCol] : pTable.columns[_nCol].columnName;

                    if (pType == BravoXmlStringTypeEnum.AttributeMapping) {
                        _sb.append(' ');
                        _sb.append(_zColName);
                        _sb.append("=\"");
                        _sb.append(_zVal);
                        _sb.append("\"");
                    }
                    else {
                        _sb.append("\t\t<");
                        _sb.append(_zColName);
                        _sb.append('>');
                        _sb.append(_zVal);
                        _sb.append("</");
                        _sb.append(_zColName);
                        _sb.appendLine(">");
                    }

                }
            }

            if (pType == BravoXmlStringTypeEnum.AttributeMapping) {
                _sb.append(" />\n");
            }
            else {
                _sb.append("\t</");
                _sb.append(_zTbName);
                _sb.appendLine(">");
            }
        }
        return _sb.toString();
    }

    public static writeXmlSchema(data: any, sw: StringWriter) {
        let _sb = sw.stringBuilder;

        let _ds: IWebSet = wjc.tryCast(data, 'IWebSet');
        if (_ds != null) {
            _sb.appendLine('  <xs:schema id="NewDataSet" xmlns="" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata" xmlns:msprop="urn:schemas-microsoft-com:xml-msprop">');
            _sb.appendLine('\t<xs:element name="NewDataSet" msdata:IsDataSet="true" msdata:UseCurrentLocale="true">');
            _sb.appendLine('\t  <xs:complexType>');
            _sb.appendLine('\t\t<xs:choice minOccurs="0" maxOccurs="unbounded">');

            for (let _tb of _ds.tables) {
                _sb.appendLine(String.format('\t\t  <xs:element name="{0}">', _tb.name));
                _sb.appendLine('\t\t\t<xs:complexType>');
                _sb.appendLine('\t\t\t  <xs:sequence>');
                for (let _dc of _tb.rows[0].table.columns) {
                    if (_dc instanceof WebDataColumn) {
                        let _caption = '', _stringType = '', _default = '';

                        if (!String.isNullOrEmpty(_dc.caption))
                            _caption = String.format('msdata:Caption="{0}"',
                                _dc.caption.replace(/\n/g, ' '));

                        if (_dc.dataType == TypeCode.String)
                            _stringType = String.format('type="xs:{0}" minOccurs="0"', TypeCode[_dc.dataType].toString());
                        else
                            _stringType = String.format('type="xs:{0}"', TypeCode[_dc.dataType].toString());

                        if (!String.isNullOrEmpty(_dc.defaultValue)) _default = String.format('default="{0}"', _dc.defaultValue.toString());

                        _sb.appendLine(String.format('\t\t\t\t<xs:element name="{0}" {1} {2} {3} />', _dc.columnName, _caption, _stringType, _default));
                    }
                }

                _sb.appendLine('\t\t\t  </xs:sequence>')
                _sb.appendLine('\t\t\t</xs:complexType>');
                _sb.appendLine('\t\t  </xs:element>');
            }

            _sb.appendLine('\t\t</xs:choice>');
            _sb.appendLine('\t  </xs:complexType>');
            _sb.appendLine('\t</xs:element>');
            _sb.appendLine('  </xs:schema>');

        }
        else if (data instanceof WebTable) {
            _sb.appendLine(String.format('\t\t  <xs:element name="{0}">', data.name));
            _sb.appendLine('\t\t\t<xs:complexType>');
            _sb.appendLine('\t\t\t  <xs:sequence>');

            for (let _dc of data.columns) {
                if (_dc instanceof WebDataColumn) {
                    let _caption = '', _stringType = '', _default = '';
                    if (!wjc.isNullOrWhiteSpace(_dc.caption)) _caption = String.format('msdata:Caption="{0}"', _dc.caption);

                    if (_dc.dataType == TypeCode.String)
                        _stringType = String.format('type="xs:{0}" minOccurs="0"', TypeCode[_dc.dataType].toString());
                    else
                        _stringType = String.format('type="xs:{0}"', TypeCode[_dc.dataType].toString());

                    if (!wjc.isNullOrWhiteSpace(_dc.defaultValue)) _default = String.format('default="{0}"', _dc.defaultValue.toString());


                    _sb.appendLine(String.format('\t\t\t\t<xs:element name="{0}" {1} {2} {3} />', _dc.columnName, _caption, _stringType, _default));
                }
            }

            _sb.appendLine('\t\t\t  </xs:sequence>')
            _sb.appendLine('\t\t\t</xs:complexType>');
            _sb.appendLine('\t\t  </xs:element>');
        }
    }
}

function loopChar(text, level?) {
    let _resutl = '';
    if (level) {
        for (let i = 0; i < level; i++) {
            _resutl += text;
        }
    }

    return _resutl;
}

export class StringBuilder {

    private _strings: Array<string> = [];
    public get strings(): Array<string> {
        return this._strings;
    }
    public set strings(value: Array<string>) {
        this._strings = value;
    }

    constructor() { }

    append(value) {
        if (value) {
            this.strings.push(value);
        }
    }
    appendLine(value) {
        if (value) {
            this.strings.push(String.format('{0}\n', value));
        }
    }
    clear() {
        this.strings.length = 0;
    }

    toString() {
        return this.strings.join("");
    }
}

export class StringWriter {

    private _encoded: any;
    public get encoded(): any {
        return this._encoded;
    }
    public set encoded(value: any) {
        this._encoded = value;
    }

    private _stringBuilder: StringBuilder;
    public get stringBuilder(): StringBuilder {
        return this._stringBuilder;
    }
    public set stringBuilder(value: StringBuilder) {
        this._stringBuilder = value;
    }

    private _format: any;
    public get format(): any {
        return this._format;
    }
    public set format(value: any) {
        this._format = value;
    }

    constructor(sb?: StringBuilder, format?: any) {

        if (sb)
            this._stringBuilder = sb;

        if (format)
            this._format = format;
    }

    close() {
        this.stringBuilder.clear();
    }




}
export enum BravoXmlStringTypeEnum {
    AttributeMapping = 0,
    ElementMappingWithSchema = 1
}