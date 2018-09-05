/**
 * Validation Error
 *
 * @author Mandrescu Nadejda
 */
export default class ValidationError {
  constructor(path, errorMessage) {
    this._path = path;
    this._errorMessage = errorMessage;
  }

  set path(path) {
    this._path = path;
  }

  get path() {
    return this._path;
  }

  set errorMessage(errorMessage) {
    this._errorMessage = errorMessage;
  }

  get errorMessage() {
    return this._errorMessage;
  }

  toString() {
    return `${this.path} : ${this.errorMessage}`;
  }
}
