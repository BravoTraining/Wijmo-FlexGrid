import * as wjc from 'wijmo/wijmo';

export function asEnum(value: any, enumType: any, nullOK = false): number {
    if (value == null && nullOK) return null;
    let e = enumType[value];
    wjc.assert(e != null, String.format('Invalid enum value. {0}', e));
    return Number.isNumber(e) ? e : value;
}

/**
     * Performs HTTP requests.
     *
     * @param url String containing the URL to which the request is sent.
     * @param settings An optional object used to configure the request.
     *
     * The <b>settings</b> object may contain the following:
     *
     * <table>
     * <tr>
     *   <td><b>method</b></td>
     *   <td>The HTTP method to use for the request (e.g. "POST", "GET", "PUT").
     *       The default is "GET".</td>
     * </tr>
     * <tr>
     *   <td><b>data</b></td>
     *   <td>Data to be sent to the server. It is appended to the url for GET requests,
     *       and converted to a string for other requests.</td>
     * </tr>
     * <tr>
     *   <td><b>async</b></td>
     *   <td>By default, all requests are sent asynchronously (i.e. this is set to true by default).
     *       If you need synchronous requests, set this option to false.</td>
     * </tr>
     * <tr>
     *   <td><b>success</b></td>
     *   <td>A function to be called if the request succeeds.
     *       The function gets passed a single parameter of type <b>XMLHttpRequest</b>.</td>
     * </tr>
     * <tr>
     *   <td><b>error</b></td>
     *   <td>A function to be called if the request fails.
     *       The function gets passed a single parameter of type <b>XMLHttpRequest</b>.</td>
     * </tr>
     * <tr>
     *   <td><b>complete</b></td>
     *   <td>A function to be called when the request finishes (after success and error callbacks are executed).
     *       The function gets passed a single parameter of type <b>XMLHttpRequest</b>.</td>
     * </tr>
     * <tr>
     *   <td><b>beforeSend</b></td>
     *   <td>A function to be called immediately before the request us sent.
     *       The function gets passed a single parameter of type <b>XMLHttpRequest</b>.</td>
     * </tr>
     * <tr>
     *   <td><b>requestHeaders</b></td>
     *   <td>A JavaScript object containing key/value pairs to be added to the request
     *       headers.</td>
     * </tr>
     * <tr>
     *   <td><b>user</b></td>
     *   <td>A username to be used with <b>XMLHttpRequest</b> in response to an HTTP access
     *       authentication request.</td>
     * </tr>
     * <tr>
     *   <td><b>password</b></td>
     *   <td>A password to be used with <b>XMLHttpRequest</b> in response to an HTTP access
     *       authentication request.</td>
     * </tr>
     * </table>
     *
     * Use the <b>success</b> to obtain the result of the request which is provided in
     * the callback's <b>XMLHttpRequest</b> parameter. For example, the code below uses
     * the @see:httpRequest method to retrieve a list of customers from an OData service:
     *
     * <pre>wijmo.httpRequest('http://services.odata.org/Northwind/Northwind.svc/Customers?$format=json', {
     *   success: function (xhr) {
     *     var response = JSON.parse(xhr.response),
     *         customers = response.value;
     *     // do something with the customers...
     *   }
     * });</pre>
     *
     * @return The <b>XMLHttpRequest</b> object used to perform the request.
     */
export function httpRequest(url: string, settings?: any): XMLHttpRequest {
    if (!settings) settings = {};

    // select method and basic options
    let method = settings.method ? wjc.asString(settings.method).toUpperCase() : 'GET',
        asynk = settings.async != null ? wjc.asBoolean(settings.async) : true,
        data = settings.data;

    // convert data to url parameters for GET requests
    if (data != null && method == 'GET') {
        let s = [];
        for (let k in data) {
            let val = data[k];
            if (wjc.isDate(val)) {
                val = val.toJSON();
            }
            s.push(k + '=' + val);
        }
        if (s.length) {
            let sep = url.indexOf('?') < 0 ? '?' : '&';
            url += sep + s.join('&');
        }
        data = null;
    }

    // create the request
    let xhr = new XMLHttpRequest();
    xhr['URL_DEBUG'] = url; // add some debug info

    // if the data is not a string, stringify it
    let isJson = false;
    if (data != null && !wjc.isString(data)) {
        isJson = wjc.isObject(data);
        data = JSON.stringify(data);
    }

    // callbacks
    xhr.onload = function () {
        if (xhr.readyState == 4) {
            if (xhr.status < 300) {
                if (settings.success) {
                    wjc.asFunction(settings.success)(xhr);
                }
            } else if (settings.error) {
                wjc.asFunction(settings.error)(xhr);
            }
            if (settings.complete) {
                wjc.asFunction(settings.complete)(xhr);
            }
        }
    };
    xhr.onerror = function () {
        if (wjc.isFunction(settings.error)) {
            settings.error(xhr);
        } else {
            throw 'HttpRequest Error: ' + xhr.status + ' ' + xhr.statusText;
        }
    };

    // send the request
    xhr.open(method, url, asynk, settings.user, settings.password);
    if (settings.user && settings.password) {
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(settings.user + ':' + settings.password))
    }

    if (settings.contentType) {
        xhr.setRequestHeader('Content-Type', settings.contentType);
    }
    else if (isJson) {
        xhr.setRequestHeader('Content-Type', 'application/json');
    }

    if (settings.requestHeaders) {
        for (let key in settings.requestHeaders) {
            xhr.setRequestHeader(key, settings.requestHeaders[key])
        }
    }
    if (wjc.isNumber(settings.timeout)) {
        xhr.timeout = settings.timeout;
    }
    if (wjc.isFunction(settings.beforeSend)) {
        settings.beforeSend(xhr);
    }
    xhr.send(data);

    // return the request
    return xhr;
}