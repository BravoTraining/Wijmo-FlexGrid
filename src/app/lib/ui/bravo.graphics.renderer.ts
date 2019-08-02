import * as wjc from 'wijmo/wijmo';
import { Font } from './font';

export class BravoGraphicsRenderer {
    public static measureString(pzText: string, font: Font, pnWidth?: number) {
        let _canvas = document.createElement('canvas');
        if (pnWidth) _canvas.width = pnWidth;

        let _ctx = _canvas.getContext('2d');
        _ctx.font = String.format("{0} {1}", font.Size, font.FontFamily);

        let _rs = _ctx.measureText(pzText);
        _canvas.remove();

        return _rs;
    }

    public static calculateSizeToFit(imageSize: wjc.Size, boxSize: wjc.Size, pSizeMode: SizeModeEnum) {
        if (pSizeMode == SizeModeEnum.Stretch)
            return boxSize;

        let _widthScale = boxSize.width / imageSize.width;
        let _heightScale = boxSize.height / imageSize.height;

        let _scale = pSizeMode == SizeModeEnum.ZoomOut ? Math.max(_widthScale, _heightScale) :
            Math.min(_widthScale, _heightScale);

        return new wjc.Size(
            Math.round(imageSize.width * _scale),
            Math.round(imageSize.height * _scale)
        )
    }
}

export enum SizeModeEnum {
    Stretch,
    ZoomIn,
    ZoomOut
}