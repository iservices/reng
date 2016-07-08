import { Injector, Inject, Injectable } from '@angular/core';

/**
 * Holds references of all of the injectable classes in the package.
 */
export default class InjectBase {

  /**
   * Shortcut for the injected App.
   */
  static get App() {
    return Inject(Injector); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected Page.
   */
  static get Page() {
    return Inject('Reng-Page'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected AppConfig.
   */
  static get AppConfig() {
    return Inject('Reng-AppConfig'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected AppInput.
   */
  static get AppInput() {
    return Inject('Reng-AppInput'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected Errors.
   */
  static get Errors() {
    return Inject('Reng-Errors'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected Http.
   */
  static get Http() {
    return Inject('Reng-Http'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected Store.
   */
  static get Store() {
    return Inject('Reng-Store'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injected Storage.
   */
  static get Storage() {
    return Inject('Reng-Storage'); // eslint-disable-line babel/new-cap
  }

 /**
   * Shortcut for the injected Debug.
   */
  static get Debug() {
    return Inject('Reng-Debug'); // eslint-disable-line babel/new-cap
  }

  /**
   * Shortcut for the injectable class.
   */
  static get Injectable() {
    return Injectable;
  }
}
