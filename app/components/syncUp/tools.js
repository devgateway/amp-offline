/* eslint-disable import/prefer-default-export */
import { Constants } from 'amp-ui';
import translate from '../../utils/translate';

export function translateSyncStatus(status) {
  switch (status) {
    case Constants.SYNCUP_STATUS_SUCCESS: return translate('Success');
    case Constants.SYNCUP_STATUS_FAIL: return translate('Fail');
    case Constants.SYNCUP_STATUS_PARTIAL: return translate('Partial');
    default: return status;
  }
}
