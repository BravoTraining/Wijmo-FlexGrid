export interface IBravoBarCode {
    codeValue: string;
    barCodeType: any;
    backColor?: any;
    showLabelText?: boolean;
    autoScale?: boolean;
    vertAlignment?: any;
    horAlignment?: any;

    width?: number;
    height?: number;

    getImage();
}