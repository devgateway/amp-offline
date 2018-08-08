import ValidationError from './ValidationError';

/**
 * A simple collector for validation errors
 *
 * @author Mandrescu Nadejda
 */
export default class ValidationErrorsCollector {
  constructor() {
    this._errors = [];
  }

  addError(error: ValidationError) {
    this._errors.push(error);
  }

  addErrors(errors: Array<ValidationError>) {
    this._errors.push(...errors);
  }

  clear() {
    this._errors = [];
  }

  get errors() {
    return this._errors;
  }
}
