import { FormGroup } from "@angular/forms";
import { DockStyle } from "../bravo.control.base";
import { AnchorStyles } from "../enums";
import { BravoBinding } from '../../ui/components/bravo.binding';

export interface IBravoControlBase {
    type?: string;
    name: string;
    anchor?: AnchorStyles;
    value?: any;
    row?: number;
    col?: number;
    rowSpan?: number;
    columnSpan?: number;
    controls?: IBravoControlBase[];
    width?: number;
    height?: any;
    text?: string;
    key?: any;
    tag?: any;
    visible: boolean,
    parentForm?: FormGroup;
    parent?: IBravoControlBase;
    bInitControl?: boolean;
    dock?: DockStyle;
    enabled?: boolean;
    hostElement?: HTMLElement;
    dataBinding?: BravoBinding;
    implementsInterface(interfaceName: string): boolean;
}