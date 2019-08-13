///DuongNHT
import * as wjc from 'wijmo/wijmo';
import { DropDown } from '../../../controller/dropdown';

const MobileDeviceLongTouchDuration = 800;
const AttributeNameOfContextMenuOwner = '_cmOwner';
const MessageElementAlreadyContainsContextMenu = 'Owner element can\'t contains multiple contextmenu. {0}';

export class BravoContextMenu extends DropDown {

    private _bindContextMenuHandle = this._contextMenuHandle.bind(this);
    private _bindHandleOnTouchStart = this._handleOnTouchStart.bind(this);
    private _bindHandleOnTouchEnd = this._handleOnTouchEnd.bind(this);
    private _mobDevice_touchTimer: any;

    public tag: any = null;

    private _bManualShowPopup: boolean;

    public get bManualShowPopup(): boolean {
        return this._bManualShowPopup;
    }

    private _positionX: number;
    private _positionY: number;

    public get position(): wjc.Point {
        return new wjc.Point(this._positionX, this._positionY);
    }

    public set position(val) {
        this._positionX = val.x;
        this._positionY = val.y;
    }

    private _style: any;
    public get style() {
        return this._style;
    }
    public set style(options) {
        this._style = options;
        wjc.setCss(this.dropDown, options);
    }
    public constructor(pOwnerElement: HTMLElement, pbManualShowPopup: boolean = false, ...pItems: Array<any>) {
        super(document.createElement('div'), ...pItems);

        if (pOwnerElement.hasAttribute(AttributeNameOfContextMenuOwner)) {
            throw new Error(String.format(MessageElementAlreadyContainsContextMenu, 'Error ->' + pOwnerElement.outerHTML.left(100)));
        }
        else {
            pOwnerElement.setAttribute(AttributeNameOfContextMenuOwner, '');
        }

        this._bManualShowPopup = pbManualShowPopup;
        this._ownerElement = pOwnerElement

        if (!this._bManualShowPopup) {
            this._ownerElement.addEventListener('contextmenu', this._bindContextMenuHandle, false);
            if (wjc.isMobile()) {
                this._ownerElement.addEventListener("touchstart", this._bindHandleOnTouchStart, false);
                this._ownerElement.addEventListener("touchend", this._bindHandleOnTouchEnd, false);
            }
        }
    }

    public show(pPoint?: any) {
        if (pPoint) {
            super.show(pPoint);
        } else {
            if (this.position) {
                super.show(this.position);
            }
            else {
                super.show();
            }
        }
    }

    private _contextMenuHandle(e: MouseEvent) {
        e.preventDefault();
        this._positionX = e.pageX;
        this._positionY = e.pageY;
        if (this._onLoadComplete()) {
            this.show(this.position);
            e.stopPropagation();
        }
    }

    private _handleOnTouchStart(e: TouchEvent) {
        this._mobDevice_touchTimer = setTimeout(() => {
            if (e.targetTouches.length > 1) return;
            let _touch = e.touches[0];
            this._positionX = _touch.pageX;
            this._positionX = _touch.pageY;
            if (this.isDroppedDown) {
                this.hide();
            }

            let _point = new wjc.Point(_touch.pageX + Math.round(_touch.radiusX), _touch.pageY);

            if (this._onLoadComplete()) {
                this.show(_point);
                e.stopPropagation();
            }
            this._mobDevice_touchTimer = null;
        }, MobileDeviceLongTouchDuration);
    };

    private _handleOnTouchEnd(e: TouchEvent) {
        if (this._mobDevice_touchTimer) {
            // clear timer's action when touchEnd raise before timer finish.
            clearTimeout(this._mobDevice_touchTimer);
        } else {
            // block default action of touching event when popup is shown.
            e.preventDefault();
        }
    };

    dispose() {
        super.dispose();
        if (!this._bManualShowPopup) {
            this._ownerElement.removeEventListener('contextmenu', this._bindContextMenuHandle, false);
            if (wjc.isMobile()) {
                this._ownerElement.removeEventListener("touchstart", this._bindHandleOnTouchStart, false);
                this._ownerElement.removeEventListener("touchend", this._bindHandleOnTouchEnd, false);
            }
        }
    }
}
