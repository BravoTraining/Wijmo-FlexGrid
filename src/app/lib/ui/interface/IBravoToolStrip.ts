import { Image, DisplayStyleEnum, AlignmentEnum } from '../../core/core';
import { MergeAction } from '../enums';

export interface IBravoToolStrip {
    name: string;
    text: string;
    image: Image;
    displayStyle: DisplayStyleEnum;
    alignment: AlignmentEnum;
    tag: any;
    header: string
    hotKey: string;
    className: string;
    url: string;
    clickedFunction: Function;
    isChanged: boolean;
    refresh();
    visible: boolean;
    enabled: boolean;
    checked: boolean;
    canCheck: boolean;
    mergeAction: MergeAction;
    bBelongsToDropDown: boolean;
    renderWidth();
    dispose();
}
