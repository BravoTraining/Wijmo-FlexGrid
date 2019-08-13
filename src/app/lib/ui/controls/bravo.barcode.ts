// import * as wjc from "wijmo/wijmo";
// import { BarCodeTypeEnum } from '../enums';
// import { IBravoBarCode } from '../interface/IBravoBarCode';
// declare var Stimulsoft: any;

// export class BravoBarCode extends Stimulsoft.Report.BarCodes.StiBarCode implements IBravoBarCode {

//     private _code: string;
//     public get code(): string {
//         return this._code;
//     }
//     public set code(value: string) {
//         this._code = value;
//     }

//     private _codeValue: string;
//     public get codeValue(): string {
//         return this._codeValue;
//     }
//     public set codeValue(value: string) {
//         this.code = value;
//         this._codeValue = value;
//     }

//     private _barCodeType: any;
//     public get barCodeType(): any {
//         return this._barCodeType;
//     }
//     public set barCodeType(value: any) {
//         if (wjc.isString(value)) {
//             value = BarCodeTypeEnum[value];
//             if (!getBarCodeType(value))
//                 throw new Error('BarCodeType is not support');
//             this._barCodeType = getBarCodeType(value);
//         }
//         else {
//             if (!getBarCodeType(value))
//                 throw new Error('BarCodeType is not support');
//             this._barCodeType = getBarCodeType(value);
//         }
//     }

//     private _backColor: any = Stimulsoft.System.Drawing.Color.fromName('empty');
//     public get backColor(): any {
//         return this._backColor;
//     }
//     public set backColor(value: any) {
//         if (wjc.isString(value)) {
//             this._backColor = Stimulsoft.System.Drawing.Color.fromName(value)
//         }
//         else {
//             this._backColor = value;
//         }
//     }

//     private _showLabelText: boolean = false;
//     public get showLabelText(): boolean {
//         return this._showLabelText;
//     }
//     public set showLabelText(value: boolean) {
//         this._showLabelText = value;
//     }

//     private _autoScale: boolean = true;
//     public get autoScale(): boolean {
//         return this._autoScale;
//     }
//     public set autoScale(value: boolean) {
//         this._autoScale = value;
//     }

//     private _vertAlignment: any = EnumStiVertAlignment.Center;
//     public get vertAlignment(): any {
//         return this._vertAlignment;
//     }
//     public set vertAlignment(value: any) {
//         if (wjc.isString(value)) {
//             this._vertAlignment = EnumStiVertAlignment[value];
//         }
//         else {
//             this._vertAlignment = value;
//         }
//     }

//     private _horAlignment: any = EnumStiHorAlignment.Center;
//     public get horAlignment(): any {
//         return this._horAlignment;
//     }
//     public set horAlignment(value: any) {
//         if (wjc.isString(value)) {
//             this._horAlignment = EnumStiHorAlignment[value];
//         }
//         else {
//             this._horAlignment = value;
//         }
//     }

//     private _width: number = 300;
//     public get width(): number {
//         return this._width;
//     }
//     public set width(value: number) {
//         this._width = value;
//     }

//     private _height: number = 100;
//     public get height(): number {
//         return this._height;
//     }
//     public set height(value: number) {
//         this._height = value;
//     }

//     private _top: number = 100;
//     public get top(): number {
//         return this._top;
//     }
//     public set top(value: number) {
//         this._top = value;
//     }

//     private _bottom: number = 100;
//     public get bottom(): number {
//         return this._bottom;
//     }
//     public set bottom(value: number) {
//         this._bottom = value;
//     }

//     private _font: any = new Stimulsoft.System.Drawing.Font();
//     public get font(): any {
//         return this._font;
//     }
//     public set font(value: any) {
//         if (wjc.isString(value)) {
//             this._font = new Stimulsoft.System.Drawing.Font(value);
//         }
//         else {
//             this._font = value;
//         }

//     }

//     constructor() {
//         super();
//     }

//     getImage() {
//         let svgData = new Stimulsoft.Report.Export.StiSvgData();

//         svgData.component = this;
//         svgData.width = this.width;
//         svgData.height = this.height;
//         svgData.x = 0;
//         svgData.y = 0;

//         let _xml = new Stimulsoft.System.Xml.XmlTextWriter(Stimulsoft.System.Text.Encoding.UTF8);
//         Stimulsoft.Report.Export.StiSvgHelper.writeBarCode(_xml, svgData);
//         _xml.flush()

//         let _heightSvg = svgData.height, _newText = document.createElementNS(null, "text");;
//         if (this.showLabelText) {
//             _heightSvg = svgData.height + 10;

//             if (this.barCodeType.mainHeight == this.barCodeType.mainWidth) {
//                 _newText.setAttributeNS(null, "x", (this.width / 2 - ((BravoBarCode.getTextWidthPx(this.codeValue, this.font.name) + (this.codeValue.length * 5)) / 2)).toString());
//                 _newText.setAttributeNS(null, "y", (this.height).toString());
//                 _newText.setAttributeNS(null, "font-size", (this.font.size).toString());
//                 _newText.setAttributeNS(null, "font-family", this.font.name);
//                 _newText.setAttributeNS(null, "letter-spacing", "5");

//                 let textNode = document.createTextNode(this.codeValue);
//                 _newText.appendChild(textNode);
//             }
//         }

//         let _svg = String.format('<svg xmlns="http://www.w3.org/2000/svg" style="width: {0}; height: {1}"><rect x="0" y="0" width="{0}" height="{1}" style="fill: #ffffff00;"/>{2}{3}</svg>',
//             svgData.width, _heightSvg, _xml.textWriter.getStringBuilder().toString(), _newText.outerHTML)

//         var _elBarCode = document.createElement("img");
//         _elBarCode.style.display = 'flex';

//         let _svg64 = btoa(_svg);
//         let _b64Start = 'data:image/svg+xml;base64,';
//         let _image64 = _b64Start + _svg64;

//         _elBarCode.src = _image64;
//         return _elBarCode;
//     }

//     private static getTextWidthPx(text: any, font: string) {
//         var canvas = document.createElement("canvas");
//         var context = canvas.getContext("2d");
//         context.font = font;
//         var metrics = context.measureText(text);
//         return metrics.width;
//     };
// }

// function getBarCodeType(pValue: any): any {
//     switch (pValue) {
//         case BarCodeTypeEnum.None:
//             return;
//         case BarCodeTypeEnum.Ansi39:
//             return;
//         case BarCodeTypeEnum.Ansi39x:
//             return;
//         case BarCodeTypeEnum.Code_2_of_5:
//             return new Stimulsoft.Report.BarCodes.StiStandard2of5BarCodeType();
//         case BarCodeTypeEnum.Code25intlv:
//             return new Stimulsoft.Report.BarCodes.StiInterleaved2of5BarCodeType();
//         case BarCodeTypeEnum.Matrix_2_of_5:
//             return;
//         case BarCodeTypeEnum.Code39:
//             return new Stimulsoft.Report.BarCodes.StiCode39BarCodeType();
//         case BarCodeTypeEnum.Code39x:
//             return new Stimulsoft.Report.BarCodes.StiCode39ExtBarCodeType();
//         case BarCodeTypeEnum.Code_128_A:
//             return new Stimulsoft.Report.BarCodes.StiCode128aBarCodeType();
//         case BarCodeTypeEnum.Code_128_B:
//             return new Stimulsoft.Report.BarCodes.StiCode128bBarCodeType();
//         case BarCodeTypeEnum.Code_128_C:
//             return new Stimulsoft.Report.BarCodes.StiCode128cBarCodeType();
//         case BarCodeTypeEnum.Code_128auto:
//             return new Stimulsoft.Report.BarCodes.StiCode128AutoBarCodeType();
//         case BarCodeTypeEnum.Code_93:
//             return new Stimulsoft.Report.BarCodes.StiCode93BarCodeType();
//         case BarCodeTypeEnum.Code93x:
//             return new Stimulsoft.Report.BarCodes.StiCode93ExtBarCodeType();
//         case BarCodeTypeEnum.MSI:
//             return new Stimulsoft.Report.BarCodes.StiMsiBarCodeType();
//         case BarCodeTypeEnum.PostNet:
//             return new Stimulsoft.Report.BarCodes.StiPostnetBarCodeType();
//         case BarCodeTypeEnum.Codabar:
//             return new Stimulsoft.Report.BarCodes.StiCodabarBarCodeType();
//         case BarCodeTypeEnum.EAN_8:
//             return new Stimulsoft.Report.BarCodes.StiEAN8BarCodeType();
//         case BarCodeTypeEnum.EAN_13:
//             return new Stimulsoft.Report.BarCodes.StiEAN13BarCodeType();
//         case BarCodeTypeEnum.UPC_A:
//             return new Stimulsoft.Report.BarCodes.StiUpcABarCodeType();
//         case BarCodeTypeEnum.UPC_E0:
//             return new Stimulsoft.Report.BarCodes.StiUpcEBarCodeType();
//         case BarCodeTypeEnum.UPC_E1:
//             return;
//         case BarCodeTypeEnum.RM4SCC:
//             return;
//         case BarCodeTypeEnum.UCCEAN128:
//             return;
//         case BarCodeTypeEnum.QRCode:
//             return new Stimulsoft.Report.BarCodes.StiQRCodeBarCodeType();
//         case BarCodeTypeEnum.Code49:
//             return;
//         case BarCodeTypeEnum.JapanesePostal:
//             return new Stimulsoft.Report.BarCodes.StiJan13BarCodeType();
//         case BarCodeTypeEnum.Pdf417:
//             return new Stimulsoft.Report.BarCodes.StiPdf417BarCodeType();
//         case BarCodeTypeEnum.EAN128FNC1:
//             return;
//         case BarCodeTypeEnum.RSS14:
//             return;
//         case BarCodeTypeEnum.RSS14Truncated:
//             return;
//         case BarCodeTypeEnum.RSS14Stacked:
//             return;
//         case BarCodeTypeEnum.RSS14StackedOmnidirectional:
//             return;
//         case BarCodeTypeEnum.RSSExpanded:
//             return;
//         case BarCodeTypeEnum.RSSExpandedStacked:
//             return;
//         case BarCodeTypeEnum.RSSLimited:
//             return;
//         case BarCodeTypeEnum.DataMatrix:
//             return new Stimulsoft.Report.BarCodes.StiDataMatrixBarCodeType();
//         case BarCodeTypeEnum.MicroPDF417:
//             return;
//         case BarCodeTypeEnum.IntelligentMail:
//             return;
//     }
// }

// export enum EnumStiVertAlignment {
//     Bottom = 0,
//     Center = 1,
//     Top = 2
// }

// export enum EnumStiHorAlignment {
//     Center = 2,
//     Left = 1,
//     Right = 3
// }
