import View from './view';

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
}
