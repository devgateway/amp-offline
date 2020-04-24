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
    const { type, location } = this.props;
    const { activity } = this.context;
    const path = `regional_${type}`;
    const locations = activity[path].filter(l => l.region_location.id === location.location.id);
    return (<div>
      <table>
        <tbody>
          {locations.map(l =>
            (<tr>
              <td>
                <div className={styles.row}>
                  <AFField
                    parent={l} className={styles.cell_3}
                    fieldPath={`${path}~${ActivityConstants.ADJUSTMENT_TYPE}`} />
                  <AFField
                    parent={l} className={styles.cell_3}
                    fieldPath={`${path}~${ActivityConstants.TRANSACTION_AMOUNT}`} />
                  <AFField
                    parent={l} className={styles.cell_3}
                    fieldPath={`${path}~${ActivityConstants.CURRENCY}`}
                    defaultValueAsEmptyObject
                    extraParams={{ noChooseOneOption: true, showOrigValue: true }} />
                  <AFField
                    parent={l} className={styles.cell_3}
                    fieldPath={`${path}~${ActivityConstants.TRANSACTION_DATE}`} />
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
            </tr>)
        )}
        </tbody>
      </table>
    </div>);
  }
}
