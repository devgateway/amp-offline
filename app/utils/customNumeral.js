/**
 * Numeral.js is freely distributable under the terms of the MIT license.
 *
 * Copyright (c) 2012 Adam Draper
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 */
import numeral from 'numeral';

/**
 * Due to a known old issue https://github.com/adamwdraper/Numeral-js/issues/459,
 * validation method cannot work with custom thousand and decimal separators.
 *
 * validate function was extracted from the source, adjusted eslint and fixed to support custom settings
 * https://github.com/adamwdraper/Numeral-js/blob/7de892ffb438af6e63b9c4f6aff0c9bc3932f09f/src/numeral.js#L477
 *
 * @param val
 * @param culture
 * @return {*}
 */

const validate = (val, culture) => {
  let _thousandSep;
  let _valArray;
  let localeData;
  let temp;

  // coerce val to string
  if (typeof val !== 'string') {
    val += '';

    if (console.warn) {
      console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
    }
  }

  // trim whitespaces from either sides
  val = val.trim();

  // if val is just digits return true
  if (val.match(/^\d+$/)) {
    return true;
  }

  // if val is empty return false
  if (val === '') {
    return false;
  }

  // get the decimal and thousands separator from numeral.localeData
  try {
    // check if the culture is understood by numeral. if not, default it to current locale
    localeData = numeral.localeData(culture);
  } catch (e) {
    localeData = numeral.localeData(numeral.locale());
  }

  // setup the delimiters and currency symbol based on culture/locale
  const _currSymbol = localeData.currency.symbol;
  const _abbrObj = localeData.abbreviations;
  const _decimalSep = localeData.delimiters.decimal;
  if (localeData.delimiters.thousands === '.') {
    _thousandSep = '\\.';
  } else {
    _thousandSep = localeData.delimiters.thousands;
  }

  // validating currency symbol
  temp = val.match(/^[^\d]+/);
  if (temp !== null) {
    val = val.substr(1);
    if (temp[0] !== _currSymbol) {
      return false;
    }
  }

  // validating abbreviation symbol
  temp = val.match(/[^\d]+$/);
  if (temp !== null) {
    val = val.slice(0, -1);
    if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million &&
      temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
      return false;
    }
  }

  const _thousandRegEx = new RegExp(`${_thousandSep}{2}`);

  // AMP OFFLINE FIXES for regexp & checks to use thousand and decimal separators settings
  if (!val.match(new RegExp(`[^\\d${_thousandSep}${_decimalSep}]/g`))) {
    _valArray = val.split(_decimalSep);
    if (_valArray.length > 2) {
      return false;
    }
    const wholePartValid = _valArray[0].length === 1 ? _valArray[0].match(/^\d+$/) :
      _valArray[0].match(new RegExp(`^(\\d+(${_thousandSep}+\\d+)*)+$`));
    if (_valArray.length === 2) {
      return wholePartValid && !_valArray[0].match(_thousandRegEx) && !!_valArray[1].match(/^\d+$/);
    }
    return wholePartValid;
  }

  return false;
};

numeral.validate = validate;
