/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import Tablify from '../components/Tablify';
import Section from './Section';
import translate from '../../../../utils/translate';
import {
  ACTIVITY_INTERNAL_IDS_COLS
} from '../../../../utils/constants/ActivityConstants';
import {
  ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH,
  ACTIVITY_INTERNAL_IDS_ORGANIZATION_PATH
} from '../../../../utils/constants/FieldPathConstants';
import styles from '../ActivityPreview.css';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP Internal ids');

/**
 * Organizations and project ids section
 * @author Nadejda Mandrescu
 */
const APInternalIdsSection = (isSeparateSection) => class extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired,
    showIfEmpty: PropTypes.bool/* only makes sense if isSeparateSection is true, will render
                                  if there are no org ids*/
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  buildContent() {
    const content = [];
    content.push(this.props.buildSimpleField(ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH, true, new Set([-1]), false));
    content.push(this.props.buildSimpleField(ACTIVITY_INTERNAL_IDS_ORGANIZATION_PATH, true, new Set([-1]), false));
    return content;
  }

  render() {
    let content = this.buildContent();
    if (isSeparateSection === true) {
      // make sure content exists before formatting
      const noData = <tr><td>{translate('No Data')}</td></tr>;
      const tableContent = content ? Tablify.addRows(content, ACTIVITY_INTERNAL_IDS_COLS) : noData;
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
export const APInternalIdsFromIdentification = Section(APInternalIdsSection(false), null, false);
