import Page from './page';
import View from './view';
import Http from './http';
import Debug from './debug';
import Util from './util';
import ReducerTestView from './reducerTestView';
import * as JSDOM from 'jsdom';
import * as XHR from 'xmlhttprequest';
import * as nodeDebug from 'debug';
import { Router, NavigationEnd } from '@angular/router';

/**
 * Class used to build html output for pages.
 */
export default class PageBuilder {

  /**
   * @constructor
   *
   * @param {Object} [opts] - Options for the page builder.
   * @param {String|String[]} [opts.scripts] - Value to set for scripts property.
   * @param {String|String[]} [opts.styles] - Value to set for styles property.
   * @param {String} [opts.baseUrl] - Value to set for baseUrl property.
   */
  constructor(opts = {}) {
    this.mStyles = opts.styles || [];
    this.mScripts = opts.scripts || [];
    this.mBaseUrl = opts.baseUrl || '/';
    this.mBaseRoutesUrl = opts.baseRoutesUrl || '/';
  }

  /**
   * Get the stylesheet tags for the page.
   */
  get styles() {
    return this.mStyles;
  }

  /**
   * Set the stylesheet tags for the page.
   *
   * @param {String|String[]} value - A stylesheet tag or array of stylesheet tags.
   * @returns {void}
   */
  set styles(value) {
    this.mStyles = value;
  }

  /**
   * Get the script tags for the page.
   */
  get scripts() {
    return this.mScripts;
  }

  /**
   * Set the scripts tags for the page.
   *
   * @param {String|String[]} value - A script tag or array of script tags.
   * @returns {void}
   */
  set scripts(value) {
    this.mScripts = value;
  }

  /**
   * The base url for the page.
   */
  get baseUrl() {
    return this.mBaseUrl;
  }

  /**
   * Set the base url for the page.
   *
   * @param {String} value - The base url for the page.
   * @return {void}
   */
  set baseUrl(value) {
    this.mBaseUrl = value;
  }

  /**
   * The base url for routes.
   */
  get baseRoutesUrl() {
    return this.mBaseRoutesUrl;
  }

  /**
   * Set the base url for routes.
   *
   * @param {String} value - The base url for routes.
   * @return {void}
   */
  set baseRoutesUrl(value) {
    this.mBaseRoutesUrl = value;
  }

  /**
   * Write the given page out to a string that will load the view in a browser.
   *
   * @param {Object} [opts] - Options for the page builder.
   * @param {View} opts.view - The view to render.
   * @param {Object} opts.input - The input to render the view with.
   * @param {String|String[]} [opts.scripts] - Value to set for scripts property.
   * @param {String|String[]} [opts.styles] - Value to set for styles property.
   * @param {String} [opts.baseUrl] - Value to set for baseUrl property.
   * @returns {String} A string representation of the given page.
   */
  static renderToTemplate(opts = {}) {
    const pb = new PageBuilder(opts);
    return pb.renderToTemplate(opts.view, opts.input);
  }

  /**
   * Write the given page out to a string that will load the view in a browser.
   *
   * @param {View} view - The view to render to string.
   * @param {Object} input - Optional input to render.
   * @returns {String} A string representation of the given page.
   */
  renderToTemplate(view, input) {
    Debug.initDebugger(nodeDebug);
    Http.setXHRType(XHR.XMLHttpRequest);
    const styles = (Array.isArray(this.styles) ? this.styles.join('\n    ') : this.styles) || '';
    const scripts = (Array.isArray(this.scripts) ? this.scripts.join('\n    ') : this.scripts) || '';
    const selector = (view ? View.getSelector(view) : 'div');
    const inputTag = (input ? '<script id="page-input" type="application/json">' + JSON.stringify(input) + '</script>' : '');
    const systemTag =
      '<script id="page-input-system" type="application/json">' +
      JSON.stringify({
        baseRoutesUrl: this.baseRoutesUrl
      }) +
      '</script>';

    return `<!DOCTYPE HTML>
<html>
  <head>
    <base href='${this.baseUrl}'>
    ${styles}
    ${systemTag}
    ${inputTag}
    ${scripts}
  </head>
  <body>
    <${selector}></${selector}>
  </body>
</html>`;
  }

  /**
   * Test with a View or a Reducer.
   *
   * @param {View|Reducer} type - The view to load.
   * @param {Object} input - The input for the view.
   * @param {Object} opts - Options for the function.
   * @return {Promise} A promise that resolves with the loaded page for testing views or with a new reducer instance for testing reducers.
   */
  static test(type, input, opts = {}) {
    // set the context for tests
    Util.isTest = true;
    Debug.initDebugger(nodeDebug);
    Http.setXHRType(XHR.XMLHttpRequest);

    // override the navigate function for the page
    if (opts.page) opts.page.navigate = PageBuilder.navigate;
    else opts.page = { navigate: PageBuilder.navigate };

    // create environment
    const isView = !!View.getSelector(type);
    PageBuilder.testSetup(PageBuilder.renderToTemplate({
      view: isView ? type : ReducerTestView,
      input,
      styles: opts.styles,
      scripts: opts.scripts
    }), opts.url);

    // test a view
    if (isView) {
      return Page.load(type, input, opts)
        .then(page => {
          if (type.routes) {
            // defer resolution of promise until router navigation has completed
            return new Promise(resolve => {
              const router = page.view.injector.get(Router);
              const subscription = router.events.subscribe(event => {
                if (event.constructor === NavigationEnd) {
                  subscription.unsubscribe();
                  resolve(page);
                }
              });
            });
          }
          return page;
        });
    }

    // test a reducer
    return Page.load(ReducerTestView, input, opts)
      .then(page => {
        return page.view.createReducer(type, input);
      });
  }

  /**
   * Initialize test environment.  Should be called once, before any tests are run.
   *
   * @param {String} html - The html to load.
   * @param {String} url - The url the page is loaded at.
   * @return {void}
   */
  static testSetup(html, url) {
    // setup the simplest document possible
    const doc = JSDOM.jsdom(html, { url: url || 'http://localhost/' });

    // get the window object out of the document
    const win = doc.defaultView;

    // workaround for zone.js
    global.XMLHttpRequest = function () {};
    global.XMLHttpRequest.prototype.send = function () {};

    // defines angular2 dependencies
    require('./init');

    // set globals for mocha that make access to document and window feel
    // natural in the test environment
    global.document = doc;
    global.window = win;

    // take all properties of the window object and also attach it to the
    // mocha global object
    for (const key in win) {
      if (!window.hasOwnProperty(key)) continue;
      if (key in global) continue;

      global[key] = window[key];
    }

    // setup angular2 shims
    window.Reflect = global.Reflect;
    window.requestAnimationFrame = function () {};
    window.RegExp = RegExp;
  }

  /**
   * Used to navigate the current window to a new url for testing.
   *
   * @param {String} url - The url to navigate to.
   * @param {Page} page - The page to navigate.
   * @return {Promise} A promise that resolves after the page url has been changed.
   */
  static navigate(url, page) {
    return new Promise(resolve => {
      if (!page.viewType.routes) {
        JSDOM.changeURL(window, url);
        resolve();
      } else {
        const router = page.view.injector.get(Router);
        const subscription = router.events.subscribe(event => {
          if (event.constructor === NavigationEnd) {
            subscription.unsubscribe();
            resolve();
          }
        });

        window.history.pushState(null, null, window.location.href);
        JSDOM.changeURL(window, url);
        window.dispatchEvent(new window.Event('popstate'));
      }
    });
  }

  /**
   * Print the current HTML loaded in the test environment to the console.
   *
   * @return {void}
   */
  static printHTML() {
    console.log(window.document.documentElement.outerHTML); // eslint-disable-line no-console
  }
}
