import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import styles from './AFRegionalFundingFundingDetailItem.css';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import translate from '../../../../../utils/translate';

export default class AFRegionalFundingFundingDetailItem extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
  };

  render() {
    const { type } = this.props;
    const { activity } = this.context;
    const path = 'regional_';
    return (<div>
      <table>
        <tbody>
          <tr>
            <td>
              <div className={styles.row}>
                <AFField
                  parent={activity} className={styles.cell_3}
                  fieldPath={`${path}${type}~${ActivityConstants.ADJUSTMENT_TYPE}`} />
                <AFField
                  parent={activity} className={styles.cell_3}
                  fieldPath={`${path}${type}~${ActivityConstants.TRANSACTION_AMOUNT}`} />
                <AFField
                  parent={activity} className={styles.cell_3}
                  fieldPath={`${path}${type}~${ActivityConstants.CURRENCY}`}
                  defaultValueAsEmptyObject
                  extraParams={{ noChooseOneOption: true, showOrigValue: true }} />
                <AFField
                  parent={activity} className={styles.cell_3}
                  fieldPath={`${path}${type}~${ActivityConstants.TRANSACTION_DATE}`} />
                <AFField
                  parent={activity} className={styles.cell_3}
                  type={Types.RADIO_BOOLEAN}
                  fieldPath={`${path}${type}~${ActivityConstants.DISASTER_RESPONSE}`} />
                {(type === ActivityConstants.DISBURSEMENTS) ?
                  <AFField
                    parent={activity} className={styles.cell_3}
                    fieldPath={`${path}${type}~${ActivityConstants.DISBURSEMENT_ORDER_ID}`} />
                : null}
                <AFField
                  parent={activity} className={styles.cell_3}
                  fieldPath={`${path}${type}~${ActivityConstants.PLEDGE}`}
                  filter={[{
                    value: activity,
                    path: `${ActivityConstants.EXTRA_INFO}~${ActivityConstants.ORGANIZATION_GROUP}`
                  }]} />
                <AFField
                  parent={activity} className={styles.cell_4}
                  fieldPath={`${path}${type}~${ActivityConstants.FIXED_EXCHANGE_RATE}`}
                  extraParams={{ bigger: 0 }} />
                {/* this.generateRecipients(fundingDetail)*/}
              </div>
            </td>
            <td className={styles.delete_col}>
              <div className={styles.grid}>
                <div className={styles.cell_10}>
                  {/* <a
                    onClick={removeFundingDetailItem.bind(this, fundingDetail[ActivityConstants.TEMPORAL_ID])}
                    className={styles.delete} href={null} title={translate('Delete')}>&nbsp;</a>*/}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>);
  }
}
