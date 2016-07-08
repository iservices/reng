import ReduceMetadata from './reduceMetadata';
import RoutesMetadata from './routesMetadata';
import { Component, Inject, Injector, ChangeDetectionStrategy } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

/**
 * Provide common logic for Component definition here.
 *
 * @param {Object} options - The options defined on the component.
 * @return {Function} The decorator function.
 */
export default function (options) {
  // default change detection strategy to OnPush
  if (options.changeDetection === undefined) options.changeDetection = ChangeDetectionStrategy.OnPush;
  // set router directives when routes are specified
  if (options.routes !== undefined) {
    options.directives = !options.directives ? [ROUTER_DIRECTIVES] : [...options.directives, ROUTER_DIRECTIVES];
  }
  return (target) => {
    // decorate class to get injector and change detector for View
    if (!Reflect.hasMetadata('parameters', target)) {
      Inject(Injector)(target, undefined, 0); // eslint-disable-line babel/new-cap
    }
    // set reduce metadata
    if (options.reduce !== undefined) ReduceMetadata.decorator(options.reduce)(target);
    // set routes metadata
    if (options.routes !== undefined) RoutesMetadata.decorator(options.routes)(target);

    // angular2 component
    Component(options)(target); // eslint-disable-line babel/new-cap
  };
}
