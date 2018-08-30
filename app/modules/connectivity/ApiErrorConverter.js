import stringifyObject from 'stringify-object';
import * as ApiC from './AmpApiConstants';
import translate from '../../utils/translate';
import * as Utils from '../../utils/Utils';


/**
 * AMP API Error Converter
 * @author Nadejda Mandrescu
 */
const ApiErrorConverter = {
  toLocalError(apiError) {
    let mappedError;
    let originalError;
    if (apiError && typeof apiError === 'object') {
      Object.keys(apiError).some(code => {
        const codeMappings = ApiC.API_ERROR_TO_AMP_OFFLINE_ERROR_BY_CODE[code];
        if (codeMappings) {
          return apiError[code].some(apiMessage => {
            const localError = codeMappings[apiMessage];
            if (localError) {
              mappedError = translate(localError);
              return true;
            }
            originalError = this._messagePossiblyWithDetailsToString(apiMessage);
            return false;
          });
        } else {
          originalError = this._messagePossiblyWithDetailsToString(apiError[code].pop());
        }
        return false;
      });
    }
    return mappedError || originalError || apiError;
  },

  _messagePossiblyWithDetailsToString(apiMessage) {
    if (apiMessage instanceof Object) {
      const msgs = [];
      Object.keys(apiMessage).forEach(msg => {
        let details = apiMessage[msg];
        if (details instanceof Array) {
          details = details.join(',');
        }
        msgs.push(details ? `${msg}${msg.trim().endsWith(':') ? ' ' : ': '}${details}` : msg);
      });
      return Utils.joinMessages(msgs);
    } else if (apiMessage instanceof String) {
      return apiMessage;
    }
    return stringifyObject(apiMessage, { inlineCharacterLimit: 200 });
  }
};

export default ApiErrorConverter;
