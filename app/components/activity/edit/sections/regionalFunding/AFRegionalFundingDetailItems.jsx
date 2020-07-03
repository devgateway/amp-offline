import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import styles from './AFRegionalFundingDetailItems.css';
import AFField from '../../components/AFField';
import translate from '../../../../../utils/translate';
import { REGIONAL_SUB_PATH } from '../AFRegionalFunding';

export default class AFRegionalFundingDetailItems extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
  };

  render() {
    const { type, items, removeFundingDetailItem } = this.props;
    const path = `${REGIONAL_SUB_PATH}${type}`;
    return (<div>
      <table className={styles.table}>
        <tbody>
          {items.map(l =>
            (<tr key={Math.random()} className={styles.tr}>
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
                    <a
                      onClick={removeFundingDetailItem.bind(this, l[ActivityConstants.TEMPORAL_ID])}
                      className={styles.delete} href={null} title={translate('Delete')}>&nbsp;</a>
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
