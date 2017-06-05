import React, { Component, PropTypes } from 'react';
import Section from './Section';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import styles from './APComponents.css';
import translate from '../../../../utils/translate';
import { rawNumberToFormattedString } from '../../../../utils/NumberUtils';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';

/**
 * @author Gabriel Inchauspe
 */
class APComponents extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _buildComponents() {
    const content = [];
    this.props.activity[AC.COMPONENTS].forEach((component) => {
      if (this.props.activityFieldsManager.isFieldPathEnabled(AC.COMPONENT_TITLE)) {
        content.push(<div className={styles.title}>{component[AC.COMPONENT_TITLE]}</div>);
      }
      if (this.props.activityFieldsManager.isFieldPathEnabled(AC.COMPONENT_TYPE)) {
        content.push(<div className={styles.title}>{component[AC.COMPONENT_TYPE].value}</div>);
      }
      if (this.props.activityFieldsManager.isFieldPathEnabled(AC.COMPONENT_DESCRIPTION)) {
        content.push(<div>{component.description}</div>);
      }
      content.push(<div>{translate('Finance of the component')}</div>);
      content.push(this._buildDetail(component));
      content.push(<hr />);
    });
    return content;
  }

  _buildDetail(component) {
    const content = [];
    // TODO: Apply currency conversion to show all fundings in the same currency
    component[AC.COMPONENT_FUNDING].forEach((funding) => {
      const groups = this._extractGroups(funding);
      groups.forEach(group => {
        // TODO: Add the current currency.
        // TODO: Translate a single phrase instead of a combination of words (AMPOFFLINE-477).
        content.push(<tr>
          <td>{group.year}</td>
          <td>{translate(`${group.adjType.value} ${group.trnType.value}`)}</td>
          <td>{rawNumberToFormattedString(group.amount)}</td>
        </tr>);
      });
    });
    const table = (<div>
      <table className={styles.table}>
        <tbody>{content}</tbody>
      </table>
    </div>);
    return table;
  }

  _extractGroups(funding) {
    const groups = [];
    const auxFd = {
      adjType: funding[AC.ADJUSTMENT_TYPE],
      trnType: funding[AC.TRANSACTION_TYPE],
      key: funding.id,
      currency: funding[AC.CURRENCY],
      amount: funding[AC.AMOUNT],
      year: this._extractYear(funding[AC.TRANSACTION_DATE])
    };
    const group = groups.find(o => o.adjType.id === auxFd.adjType.id
    && o.trnType.id === auxFd.trnType.id
    && o.year === auxFd.year);
    if (!group) {
      groups.push(auxFd);
    } else {
      // TODO: we need currency conversion here.
      group.amount += auxFd.amount;
    }
    return groups;
  }

  _extractYear(dateString) {
    return new Date(Date.parse(dateString)).getFullYear();
  }

  render() {
    return (<div>
      {this._buildComponents()}
    </div>);
  }
}

export default Section(APComponents, 'Components');
