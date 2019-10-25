/**
 * @author Nadejda Mandrescu
 */
export default class ActionDef {
  constructor({ href, navUrl, onClick }) {
    this.href = href;
    this.navUrl = navUrl;
    this.onClick = onClick;
  }

  set href(href) {
    this._href = href;
  }

  get href() {
    return this._href;
  }

  set navUrl(navUrl) {
    this._navUrl = navUrl;
  }

  get navUrl() {
    return this._navUrl;
  }

  set onClick(onClick) {
    this._onClick = onClick;
  }

  get onClick() {
    return this._onClick;
  }
}
