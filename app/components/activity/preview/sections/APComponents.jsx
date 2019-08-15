import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldPathConstants, FieldsManager, Section } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import styles from './APComponents.css';
import translate from '../../../../utils/translate';
import { rawNumberToFormattedString } from '../../../../utils/NumberUtils';
import DateUtils from '../../../../utils/DateUtils';
import * as Utils from '../../../../utils/Utils';

const logger = new Logger('AP Components');

/**
 * @author Gabriel Inchauspe
 */
class APComponents extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  static _extractYear(dateString) {
    return new Date(Date.parse(dateString)).getFullYear();
  }

  static _extractGroups(funding, trnType) {
    const groups = [];
    const auxFd = {
      adjType: funding[ActivityConstants.ADJUSTMENT_TYPE],
      trnType,
      key: funding.id,
      currency: funding[ActivityConstants.CURRENCY],
      amount: funding[ActivityConstants.AMOUNT],
      year: APComponents._extractYear(funding[ActivityConstants.TRANSACTION_DATE])
    };
    const group = groups.find(o => o.adjType.id === auxFd.adjType.id
    && o.trnType === auxFd.trnType
    && o.year === auxFd.year);
    if (!group) {
      groups.push(auxFd);
    } else {
      // TODO: we need currency conversion here.
      group.amount += auxFd.amount;
    }
    return groups;
  }

  static _buildDetail(component) {
    const content = [];
    // TODO: Apply currency conversion to show all fundings in the same currency
    FieldPathConstants.TRANSACTION_TYPES.forEach(trnType => {
      const fundings = component[trnType];
      if (fundings && fundings.length) {
        const groups = APComponents._extractGroups(fundings, trnType);
        groups.forEach(group => {
          // TODO: Add the current currency.
          // TODO: Translate a single phrase instead of a combination of words (AMPOFFLINE-477).
          content.push(<tr>
            <td>{group.year}</td>
            <td>{translate(`${group.adjType.value} ${group.trnType}`)}</td>
            <td>{rawNumberToFormattedString(group.amount)}</td>
          </tr>);
        });
      }
    });
    const table = (<div>
      <table className={styles.table}>
        <tbody>{content}</tbody>
      </table>
    </div>);
    return table;
  }

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  _buildComponents() {
    const content = [];
    this.props.activity[ActivityConstants.COMPONENTS].forEach((component) => {
      if (this.props.activityFieldsManager.isFieldPathEnabled(ActivityConstants.COMPONENT_TITLE)) {
        content.push(<div className={styles.title}>{component[ActivityConstants.COMPONENT_TITLE]}</div>);
      }
      if (this.props.activityFieldsManager.isFieldPathEnabled(ActivityConstants.COMPONENT_TYPE)) {
        content.push(<div className={styles.title}>{component[ActivityConstants.COMPONENT_TYPE].value}</div>);
      }
      if (this.props.activityFieldsManager.isFieldPathEnabled(ActivityConstants.COMPONENT_DESCRIPTION)) {
        content.push(<div>{component.description}</div>);
      }
      content.push(<div>{translate('Finance of the component')}</div>);
      content.push(APComponents._buildDetail(component));
      content.push(<hr />);
    });
    return content;
  }

  render() {
    return (<div>
      {this._buildComponents()}
    </div>);
  }
}

export default Section(APComponents, { SectionTitle: 'Components',
  Logger,
  translate,
  DateUtils,
  Utils
});
