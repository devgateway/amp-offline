import React from 'react';
import InternalIdsSection from './InternalIdsSection';
import translate from '../../../utils/translate';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Internal Ids from Identification section
 * @author Nadejda Mandrescu
 */
export default class InternalIdsFromIdentificationSection extends InternalIdsSection {
  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    let content = this.buildContent();
    if (content) {
      content = content.map(orgData => (<li key={orgData.key}>{orgData}</li>));
      content = (
        <div>
          <span>{ translate('Organizations and Project IDs') }</span>
          <ul>
            { content }
          </ul>
        </div>
      );
    }
    return content;
  }
}
