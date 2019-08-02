import { asFunction } from "./bravo.datatype.converter";

export interface IEventHandler {
    (sender: any, args: EventArgs): void;
}

class EventHandler {
    handler: IEventHandler;
    self: any;
    constructor(handler: IEventHandler, self: any) {
        this.handler = handler;
        this.self = self;
    }
}

export class Event {
    private _handlers: EventHandler[] = [];

    /**
     * Adds a handler to this event.
     *
     * @param handler Function invoked when the event is raised.
     * @param self Object that defines the event handler 
     * (accessible as 'this' from the handler code).
     */
    addHandler(handler: IEventHandler, self?: any) {
        asFunction(handler);
        this._handlers.push(new EventHandler(handler, self));
    }

    /**
     * Removes a handler from this event.
     *
     * @param handler Function invoked when the event is raised.
     * @param self Object that defines the event handler (accessible as 'this' from the handler code).
     */
    removeHandler(handler: IEventHandler, self?: any) {
        asFunction(handler);
        for (var i = 0; i < this._handlers.length; i++) {
            var l = this._handlers[i];
            if (l.handler == handler && l.self == self) {
                this._handlers.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Removes all handlers associated with this event.
     */
    removeAllHandlers() {
        this._handlers.length = 0;
    }

    /**
     * Raises this event, causing all associated handlers to be invoked.
     *
     * @param sender Source object.
     * @param args Event parameters. 
     */
    raise(sender: any, args: EventArgs = null) {
        for (var i = 0; i < this._handlers.length; i++) {
            var l = this._handlers[i];
            l.handler.call(l.self, sender, args);
        }
    }

    /**
     * Gets a value that indicates whether this event has any handlers.
     */
    get hasHandlers(): boolean {
        return this._handlers.length > 0;
    }
}

export class EventArgs {
    public static empty = new EventArgs();
}