import { Event, ICollectionView } from 'wijmo/wijmo';

export interface IBindingList {
    listChanged: Event;
    getCollection?(): ICollectionView;
}