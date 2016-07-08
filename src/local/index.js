import Page from './page';
import Reducer from './reducer';
import ReduceMetadata from './reduceMetadata';
import RoutesMetadata from './routesMetadata';
import View from './view';
import InjectBase from './inject';
import Component from './component';
import { Injectable, Input, Output } from '@angular/core';

/**
 * Holds references of all of the public classes in the package.
 */
export default class Reng {

  /**
   * Get the Page class.
   */
  static get Page() {
    return Page;
  }

  /**
   * Get the Reducer class.
   */
  static get Reducer() {
    return Reducer;
  }

  /**
   * Get the decorator used to define a reducer.
   */
  static get Reduce() {
    return ReduceMetadata.decorator;
  }

  /**
   * Get the decorator used to define routes.
   */
  static get Routes() {
    return RoutesMetadata.decorator;
  }

  /**
   * Get the View class.
   */
  static get View() {
    return View;
  }

  /**
   * Shortcut to get the angular2 Component class.
   * Also applies some default configuration.
   */
  static get Component() {
    return Component;
  }

  /**
   * Shortcut to get the angular2 Injectable class.
   */
  static get Injectable() {
    return Injectable;
  }

  /**
   * The injectable shortcut.
   */
  static get Inject() {
    return InjectBase;
  }

  /**
   * The Input shortcut.
   */
  static get Input() {
    return Input;
  }

  /**
   * The output shortcut.
   */
  static get Output() {
    return Output;
  }
}
