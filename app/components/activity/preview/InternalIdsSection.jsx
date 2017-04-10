import React from 'react';
import Section from './Section';
import { ACTIVITY_INTERNAL_IDS } from '../../../utils/constants/ActivityConstants';
import { ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH } from '../../../utils/constants/FieldPathConstants';

/* eslint-disable class-methods-use-this */

/**
 * Organizations and project ids section
 * @author Nadejda Mandrescu
 */
export default class InternalIdsSection extends Section {
  constructor(props) {
    super(props);
    console.log('constructor');
    this._sectionName = 'Agency Internal IDs';
  }

  get sectionName() {
    return this._sectionName;
  }

  _getActInternalIdContent(actIntId, showInternalId) {
    let intId;
    if (showInternalId) {
      intId = <span>{actIntId.internalId}</span>;
    }
    return (
      <div key={actIntId.organization.value}>
        <span>[{ actIntId.organization.value }]</span>
        { intId }
      </div>);
  }

  buildContent() {
    let orgIds;
    if (this.context.activityFieldsManager.isFieldPathEnabled(ACTIVITY_INTERNAL_IDS)) {
      const showInternalId = this.context.activityFieldsManager.isFieldPathEnabled(
        ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH);
      orgIds = [];
      const actIntIds = this.context.activityFieldsManager.getValue(this.context.activity, ACTIVITY_INTERNAL_IDS);
      if (actIntIds && actIntIds.length > 0) {
        actIntIds.forEach(actIntId => orgIds.push(this._getActInternalIdContent(actIntId, showInternalId)));
      }
    }
    return orgIds;
  }

}
