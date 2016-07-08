import { provideRouter } from '@angular/router';

/**
 * Capture information on the definition of route mappings.
 */
export default class RoutesMetadata {
  /**
   * @constructor
   *
   * @param {Object} map - The mapping for routes.
   */
  constructor(map) {
    this.mMap = map;
  }
  /**
   * A decorator used to define a reducer for a class.
   *
   * @param {Object} map - A mapping object for routes.
   * @return {Function} The function that is used to decorate a class.
   */
  static decorator(map) {
    return function (target) {
      target.routes = new RoutesMetadata(map);
    };
  }

  /**
   * Build out a the route providers from the route map.
   *
   * @return {Object} The route provider.
   */
  getRoutes() {
    if (!this.mMap) {
      return [];
    }

    const routes = [];
    Object.getOwnPropertyNames(this.mMap).forEach(routeName => {
      routes.push({
        path: routeName,
        component: this.mMap[routeName]
      });
    });

    return provideRouter(routes);
  }
}
