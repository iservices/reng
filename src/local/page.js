require('reflect-metadata');
import { enableProdMode, ApplicationRef, provide, ComponentMetadata, ChangeDetectionStrategy } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import Store from './store';
import Storage from './storage';
import Http from './http';
import Debug from './debug';
import AppConfig from './appConfig';
import AppInput from './appInput';
import Errors from './errors';
import Inject from './inject';
import Util from './util';

// set to true after angular2 has been initialized.
let ngInit = false;

// holds configuration set ahead of page load process.
let config = undefined;

/**
 * Abstract definition of a page.
 */
@Inject.Injectable()
export default class Page {

  /**
   * @constructor
   *
   * @param {View} view - The view that is displayed on the page.
   * @param {Object} [input] - The input for the page.
   * @param {Object} [opts] - Configuration options for the application.
   */
  constructor(view, input, opts) {
    if (!view) {
      throw new Error('view is required in order to create page.');
    }

    this.mIsInitialized = false;
    this.mTickRunning = false;

    this.mViewType = view;
    this.mAppInput = new AppInput(input);

    if (!opts) {
      if (config) this.mAppConfig = new AppConfig(config);
      else this.mAppConfig = new AppConfig();
    } else {
      this.mAppConfig = new AppConfig(opts);
    }

    if (Util.isBrowser && !Util.isTest) {
      const element = document.getElementById('page-input-system');
      this.mBaseRoutesUrl = (!element || !element.textContent) ? {} : JSON.parse(element.textContent).baseRoutesUrl || '/';
    } else {
      this.mBaseRoutesUrl = '/';
    }

    this.title = this.mAppConfig.page.title || '';
  }

  /**
   * The type of view to display on the page.
   *
   * @returns {Object} undefined.
   */
  get viewType() {
    return this.mViewType;
  }

  /**
   * Get the view instance for this page.
   */
  get view() {
    return this.mView;
  }

  /**
   * Get the app for the page.
   */
  get app() {
    return this.mApp;
  }

  /**
   * The title for this page.
   */
  get title() {
    if (typeof document !== undefined) {
      return document.title;
    }
    return this.mTitle;
  }

  set title(value) {
    if (typeof document !== undefined) {
      document.title = value;
    } else {
      this.mTitle = value;
    }
  }

  /**
   * This function is used to manually initiate the change detection functions of angular2.
   *
   * @returns {void}
   */
  tick() {
    if (this.app && !this.mTickRunning) {
      this.mTickRunning = true;
      try {
        this.app.tick();
      } finally {
        this.mTickRunning = false;
      }
    }
  }

  /**
   * Navigate to the given url.
   *
   * @param {String} url - The url to navigate to.
   * @return {Promise} A promise that resolves when the page has been updated with the new url.
   */
  navigate(url) {
    if (typeof this.mAppConfig.page.navigate === 'function') {
      return this.mAppConfig.page.navigate(url, this);
    } else if (Util.isBrowser) {
      window.location.href = url;
    }

    return Promise.resolve();
  }

  /**
   * Set configuration that will be used whenever a page is created.
   *
   * @param {Object} opts - The mock options.
   * @return {void}
   */
  static setConfig(opts) {
    config = opts;
  }

  /**
   * Load the given view.
   *
   * @param {View} view - The view to load into a page.
   * @param {Object} [input] - The input for the given view.
   * @param {Object} [opts] - Configuration settings for the application.
   * @return {Promise} A promise that resolves to the loaded page.
   */
  static load(view, input, opts) {
    const page = new Page(view, input, opts);
    return page.load();
  }

  /**
   * This function calls the static load method but only when in the browser context.
   *
   * @param {View} view - The view to load into a page.
   * @param {Object} input - The input for the given view.
   * @param {Object} opts - Configuration settings for the application.
   * @return {Promise} A promise that resolves to the loaded page.
   */
  static bootstrap(view, input, opts) {
    if (Util.isBrowser && !Util.isTest) {
      return Page.load(view, input, opts);
    }
    return Promise.resolve(null);
  }

  /**
   * Create a sub class of base that will set the input at the root level during instantiation.
   *
   * @param {Class} base - The class to capture the injector for.
   * @param {Object} [input] - Application level input to set.
   * @return {Class} A sub class of base that can be used to capture the injector service.
   */
  static extendComponent(base, input) {
    // extend the given base class
    const Wrapper = function () {
      function Host() {
        this.input = input;
        base.apply(this, arguments);
      }
      Host.prototype = Object.create(base.prototype);
      return Host;
    };
    const wrapper = new Wrapper();

    // copy decorators from base class to the wrapper class with modifications
    Reflect.getOwnMetadataKeys(base).forEach(key => {
      if (key === 'annotations') {
        const annotations = Reflect.getOwnMetadata(key, base);
        if (annotations && annotations.length) {
          for (let i = 0; i < annotations.length; i++) {
            if (annotations[i].constructor === ComponentMetadata) {
              annotations[i].changeDetection = ChangeDetectionStrategy.Default;
            }
          }
        }
      }
      Reflect.defineMetadata(key, Reflect.getOwnMetadata(key, base), wrapper);
    });

    // copy property decorators
    Object.getOwnPropertyNames(base).forEach(propName => {
      Reflect.getOwnMetadataKeys(base, propName).forEach(key => {
        Reflect.defineMetadata(key, Reflect.getOwnMetadata(key, base), wrapper);
      });
    });

    return wrapper;
  }

  /**
   * This should be called after the page is created and it's ready to be displayed.
   *
   * @returns {Promise} A promise that resolves when the page is done loading.
   */
  load() {
    const self = this;
    if (!this.mIsInitialized) {
      this.mIsInitialized = true;
      if (!ngInit) {
        enableProdMode();
        ngInit = true;
      }

      const bootstrap = require('@angular/platform-browser-dynamic').bootstrap;
      return new Promise(function (resolve, reject) {
        bootstrap(Page.extendComponent(self.viewType, self.mAppInput.value), [
          provide(Page, { useValue: self }),
          provide('Reng-Page', { useValue: self }),
          provide(AppConfig, { useValue: self.mAppConfig }),
          provide('Reng-AppConfig', { useValue: self.mAppConfig }),
          provide(AppInput, { useValue: self.mAppInput }),
          provide('Reng-AppInput', { useValue: self.mAppInput }),
          Errors,
          provide('Reng-Errors', { useClass: Errors }),
          Http,
          provide('Reng-Http', { useClass: Http }),
          Store,
          provide('Reng-Store', { useClass: Store }),
          Storage,
          provide('Reng-Storage', { useClass: Storage }),
          Debug,
          provide('Reng-Debug', { useClass: Debug }),
          provide(APP_BASE_HREF, { useValue: self.mBaseRoutesUrl }),
          self.viewType.routes ? [self.viewType.routes.getRoutes()] : []
        ])
          .then(function (compRef) {
            self.mView = compRef.instance;
            self.mApp = compRef.injector.get(ApplicationRef);
            self.mView.__store.init();
            resolve(self);
          })
          .catch(function (err) {
            reject(err);
          });
      });
    }
    return Promise.resolve(this);
  }
}
