import Inject from './inject';

const REGEX_PATTERN = /^\/(.*)\/([gmixXsuUAJ]*)?$/;

/**
 * Holds the type to use for XHR instances.
 */
let xhrType = null;

/**
 * Class used to send http requests.
 */
@Inject.Injectable()
export default class Http {
  /**
   * @constructor
   *
   * @param {AppConfig} config - Configuration options.
   */
  constructor(@Inject.AppConfig config) {
    this.mRequestOverride = config.http.request;
    this.mRequestOverrideRegEx = {};
    if (typeof this.mRequestOverride === 'object') {
      Object.getOwnPropertyNames(this.mRequestOverride).forEach(propName => {
        if (propName[0] === '/') {
          const match = propName.match(REGEX_PATTERN);
          if (match && match.length > 1) {
            this.mRequestOverrideRegEx[propName] = new RegExp(match[1], match.length === 3 ? match[2] : undefined);
          }
        }
      });
    }
  }

  /**
   * The type to use for XHR instances when making an http request.
   *
   * @return {Object} The type to use for XHR instances.
   */
  static get XHRType() {
    if (xhrType !== null) {
      return xhrType;
    }
    if (typeof XMLHttpRequest !== 'undefined') {
      return XMLHttpRequest;
    }
    throw new Error('XHRType is not set.');
  }

  /**
   * Set the object type to use for http requests.
   *
   * @param {Object} value - The object type to use for http requests.
   * @return {void}
   */
  static setXHRType(value) {
    xhrType = value;
  }

  /**
   * Make an http request.
   *
   * @param {Object} opts - The options for the function.
   * @return {Promise} A promise that resolves with the request object completed.
   */
  request(opts = {}) {
    const format = opts.format || function (response) { return response; };

    // override the request method
    if (this.mRequestOverride) {
      if (typeof(this.mRequestOverride) === 'function') {
        return this.mRequestOverride(opts);
      }
      const key = `${opts.method}:${opts.url}`;
      // straight match
      let handler = this.mRequestOverride[key];
      // regex match
      if (handler === undefined) {
        const propNames = Object.getOwnPropertyNames(this.mRequestOverrideRegEx);
        for (let i = 0; i < propNames.length; i++) {
          if (this.mRequestOverrideRegEx[propNames[i]].test(key)) {
            handler = this.mRequestOverride[propNames[i]];
            break;
          }
        }
      }
      // method wildcard match
      if (handler === undefined) {
        handler = this.mRequestOverride[`${opts.method}:*`];
      }
      // wildcard match
      if (handler === undefined) {
        handler = this.mRequestOverride['*'];
      }

      // direct the request
      if (handler === undefined) {
        return Promise.reject(new Error(`Route not defined: ${key}`));
      } else if (typeof handler === 'function') {
        return handler(opts);
      } else if (handler.reject !== undefined) {
        return Promise.reject(handler.reject);
      } else if (handler.resolve !== undefined) {
        return Promise.resolve(format(handler.resolve));
      }
      return Promise.resolve(format(handler));
    }

    // normal request
    return new Promise((resolve, reject) => {
      try {
        // configure request
        const xhr = new Http.XHRType();
        xhr.open(opts.method, opts.url);
        if (opts.headers) {
          opts.headers.forEach(header => {
            xhr.setRequestHeader(header.key, header.value);
          });
        }
        if (opts.responseType) {
          xhr.responseType = opts.responseType;
        }
        if (opts.body) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }

        // handle response
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            try {
              const contentType = xhr.getResponseHeader('Content-Type');
              const isJSON = (contentType && contentType.toLowerCase().indexOf('application/json') !== -1);
              if (xhr.status < 299) {
                if (isJSON) {
                  resolve(format(JSON.parse(xhr.responseText)));
                } else {
                  resolve(format(xhr));
                }
              } else {
                if (isJSON) {
                  reject(JSON.parse(xhr.responseText));
                } else {
                  reject(new Error(`${xhr.status}: ${xhr.statusText}`));
                }
              }
            } catch (err) {
              reject(err);
            }
          }
        };

        // send request
        if (opts.body) {
          if (typeof opts.body === 'string') {
            xhr.send(opts.body);
          } else {
            xhr.send(JSON.stringify(opts.body));
          }
        } else {
          xhr.send();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
