/* eslint-disable import/prefer-default-export */
import translate from '../../utils/translate';
import {
  SYNCUP_STATUS_SUCCESS,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_PARTIAL
} from '../../utils/Constants';

export function translateSyncStatus(status) {
  switch (status) {
    case SYNCUP_STATUS_SUCCESS: return translate('Success');
    case SYNCUP_STATUS_FAIL: return translate('Fail');
    case SYNCUP_STATUS_PARTIAL: return translate('Partial');
    default: return status;
  }
}
