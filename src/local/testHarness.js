import * as JSDOM from 'jsdom';
import * as XHR from 'xmlhttprequest';
import * as nodeDebug from 'debug';
import Page from './page';
import View from './view';
import PageBuilder from './pageBuilder';
import Util from './util';
import Http from './http';
import Debug from './debug';
import ReducerTestView from './reducerTestView';
import { Router, NavigationEnd } from '@angular/router';

/**
 * Provides functions for testing views and reducers.
 */
export default class TestHarness {
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
   * Test with a View or a Reducer.
   *
   * @param {View|Reducer} type - The view to load.
   * @param {Object} input - The input for the view.
   * @param {Object} opts - Options for the function.
   * @return {Promise} A promise that resolves with the loaded page for testing views or with a new reducer instance for testing reducers.
   */
  static run(type, input, opts = {}) {
    // set the context for tests
    Util.isTest = true;
    Debug.initDebugger(nodeDebug);
    Http.setXHRType(XHR.XMLHttpRequest);

    // override the navigate function for the page
    if (opts.page) opts.page.navigate = TestHarness.navigate;
    else opts.page = { navigate: TestHarness.navigate };

    // create environment
    const isView = !!View.getSelector(type);
    TestHarness.testSetup(PageBuilder.renderToTemplate({
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

  /**
   * This function will check for the given element.
   *
   * @param {String|Element} element - This can be the actual element or a query string used to identify the element.
   * @return {Boolean} true if the element is found, false if it isn't.
   */
  static exists(element) {
    const resolvedElement = (typeof element === 'string') ? document.querySelector(element) : element;
    if (!resolvedElement) return false;
    return true;
  }

  /**
   * This function will get the innerHTML for the given element.
   *
   * @param {String|Element} element - This can be the actual element or a query string used to identify the element.
   * @return {String} The inner html for the given element.
   */
  static getInnerHTML(element) {
    const resolvedElement = (typeof element === 'string') ? document.querySelector(element) : element;
    if (!resolvedElement) throw new Error('Invalid element: ' + element);
    return resolvedElement.innerHTML;
  }

  /**
   * Get the named attribute for the given element.
   *
   * @param {String|Element} element - This can be the actual element or a query string used to identify the element.
   * @param {String} attributeName - The name of the attribute to get the value from.
   * @return {String} The value of the named attribute.
   */
  static getAttribute(element, attributeName) {
    const resolvedElement = (typeof element === 'string') ? document.querySelector(element) : element;
    if (!resolvedElement) throw new Error('Invalid element: ' + element);
    return resolvedElement.attributes[attributeName] ?
      resolvedElement.attributes[attributeName].value :
      undefined;
  }

  /**
   * This function will set the value for the given element as well as raise the appropriate events.
   *
   * @param {String|Element} element - This can be the actual element or a query string used to identify the element.
   * @param {String} value - The value to set for the element.
   * @return {void}
   */
  static setValue(element, value) {
    const resolvedElement = (typeof element === 'string') ? document.querySelector(element) : element;
    if (!resolvedElement) throw new Error('Invalid element: ' + element);
    resolvedElement.value = value;
    resolvedElement.dispatchEvent(new window.Event('input'));
    resolvedElement.dispatchEvent(new window.Event('change'));
  }

  /**
   * This function will set the value for the given elements as well as raise the appropriate events.
   *
   * @param {String|Element[]} elements - This can be the actual elements or a query string used to identify the elements.
   * @param {String} value - The value to set for the element.
   * @return {void}
   */
  static setValueAll(elements, value) {
    const resolvedElements = (typeof element === 'string') ? document.querySelectorAll(elements) : elements;
    for (let i = 0; i < resolvedElements.length; i++) {
      resolvedElements[i].value = value;
      resolvedElements[i].dispatchEvent(new window.Event('input'));
      resolvedElements[i].dispatchEvent(new window.Event('change'));
    }
  }

  /**
   * This function will raise a click event for the given element.
   *
   * @param {String|Element} element - This can be the actual element or a query string used to identify the element.
   * @return {void}
   */
  static click(element) {
    const resolvedElement = (typeof element === 'string') ? document.querySelector(element) : element;
    if (!resolvedElement) throw new Error('Invalid element: ' + element);
    resolvedElement.dispatchEvent(new window.Event('click'));
  }
}
