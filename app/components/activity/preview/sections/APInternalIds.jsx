/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import Tablify from '../components/Tablify';
import Section from './Section';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../utils/translate';
import { ACTIVITY_INTERNAL_IDS, ACTIVITY_INTERNAL_IDS_COLS } from '../../../../utils/constants/ActivityConstants';
import { ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH } from '../../../../utils/constants/FieldPathConstants';
import styles from '../ActivityPreview.css';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP Internal ids');

/**
 * Organizations and project ids section
 * @author Nadejda Mandrescu
 */
const APInternalIdsSection = (isSeparateSection) => class extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    showIfEmpty: PropTypes.bool/* only makes sense if isSeparateSection is true, will render
                                  if there are no org ids*/
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  _getActInternalIdContent(actIntId, showInternalId) {
    let intId;
    if (showInternalId) {
      intId = <span className={styles.floatRight}>{actIntId.internal_id}</span>;
    }
    return (
      <div key={actIntId.organization.value}>
        <span>[{ actIntId.organization.value }]</span>
        { intId }
      </div>);
  }

  buildContent() {
    let orgIds;
    if (this.props.activityFieldsManager.isFieldPathEnabled(ACTIVITY_INTERNAL_IDS)) {
      const showInternalId = this.props.activityFieldsManager.isFieldPathEnabled(
        ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH);
      orgIds = [];
      const actIntIds = this.props.activityFieldsManager.getValue(this.props.activity, ACTIVITY_INTERNAL_IDS);
      if (actIntIds && actIntIds.length > 0) {
        actIntIds.forEach(actIntId => orgIds.push(this._getActInternalIdContent(actIntId, showInternalId)));
      }
    }
    return orgIds && orgIds.length > 0 ? orgIds : null;
  }

  render() {
    let content = this.buildContent();
    if (isSeparateSection === true) {
      // make sure content exists before formatting
      const noData = <tr><td>{translate('No Data')}</td></tr>;
      const tableContent = content ? Tablify.addRows(content,  ACTIVITY_INTERNAL_IDS_COLS) : noData;
      content = <div><table className={styles.box_table}><tbody>{tableContent}</tbody></table></div>;
    } else if (content || this.props.showIfEmpty) {
      return (
        <div key="InternalIdsFromIdentificationSection">
          <ul>
            {content && content.map(orgData => (<li key={orgData.key}>{orgData}</li>))}
          </ul>
        </div>
      );
    }
    return content;
  }
};

export const APInternalIds = Section(APInternalIdsSection(true), 'Agency Internal IDs', true, 'APInternalIds');
