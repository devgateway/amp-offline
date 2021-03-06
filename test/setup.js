import 'babel-polyfill';
import { jsdom } from 'jsdom';

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;
global.__BRANCH_NAME__ = '';
window.localStorage = window.sessionStorage = {
  getItem(key) {
    return this[key];
  },
  setItem(key, value) {
    this[key] = value;
  },
  removeItem(key) {
    this[key] = undefined;
  },
};
const matchMedia = {
  matches: false,
  addListener: () => {},
  removeListener: () => {}
};
const matchMediaFunc = () => matchMedia;
window.matchMedia = window.matchMedia || matchMediaFunc;
