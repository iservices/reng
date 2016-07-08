import Inject from './inject';
import Util from './util';
import * as FakeStorage from 'fake-storage';

/**
 * Storage for data.
 */
@Inject.Injectable()
export default class Storage {
  /**
   * @constructor
   *
   * @param {AppConfig} config - The application configuration object.
   */
  constructor(@Inject.AppConfig config) {
    this.mSession = (Util.isBrowser && !Util.isTest) ? window.sessionStorage : new FakeStorage();
    this.mLocal = (Util.isBrowser && !Util.isTest) ? window.localStorage : new FakeStorage();

    if (config.storage.session) {
      for (const propName in config.storage.session) {
        if (config.storage.session.hasOwnProperty(propName)) {
          this.mSession.setItem(propName, config.storage.session[propName]);
        }
      }
    }
    if (config.storage.local) {
      for (const propName in config.storage.local) {
        if (config.storage.local.hasOwnProperty(propName)) {
          this.mLocal.setItem(propName, config.storage.local[propName]);
        }
      }
    }
  }

  /**
   * The session storage object.
   */
  get session() {
    return this.mSession;
  }

  /**
   * The local storage object.
   */
  get local() {
    return this.mLocal;
  }
}
