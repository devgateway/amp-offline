/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFField from '../../components/AFField';
import afStyles from '../../ActivityForm.css';
import styles from './AFFundingDetailItem.css';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import translate from '../../../../../utils/translate';
import * as Types from '../../components/AFComponentTypes';
import GlobalSettingsManager from '../../../../../modules/util/GlobalSettingsManager';
import { GS_YEAR_RANGE_START, GS_YEARS_IN_RANGE } from '../../../../../utils/constants/GlobalSettingsConstants';
import { IS_FISCAL } from '../../../../../utils/constants/CalendarConstants';

/**
 * @author Gabriel Inchauspe
 */
class AFMTEFProjectionItem extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  static propTypes = {
    mtefItem: PropTypes.object.isRequired,
    removeMTEFItem: PropTypes.func.isRequired,
    calendar: PropTypes.object.isRequired
  };

  render() {
    const { mtefItem, removeMTEFItem, calendar } = this.props;
    // When adding a new item we select the default currency like in AMP.
    if (!mtefItem[AC.CURRENCY].id) {
      const currency = Object.values(this.context.activityFieldsManager.possibleValuesMap[FPC.FUNDING_CURRENCY_PATH])
        .filter(pv => pv.value === this.context.currentWorkspaceSettings.currency.code);
      mtefItem[AC.CURRENCY] = currency[0];
    }
    const isFiscalCalendar = calendar[IS_FISCAL];
    const range = Number(GlobalSettingsManager.getSettingByKey(GS_YEARS_IN_RANGE));
    const startYear = Number(GlobalSettingsManager.getSettingByKey(GS_YEAR_RANGE_START));
    return (<div className={afStyles.full_width}>
      <table>
        <tbody>
          <tr>
            <td>
              <div className={styles.row}>
                <AFField
                  parent={mtefItem} className={styles.cell_3} fmPath={FMC.MTEF_PROJECTIONS_PROJECTION}
                  fieldPath={`${AC.FUNDINGS}~${AC.MTEF_PROJECTIONS}~${AC.PROJECTION}`} />
                <AFField
                  parent={mtefItem} className={styles.cell_3} fmPath={FMC.MTEF_PROJECTIONS_AMOUNT}
                  fieldPath={`${AC.FUNDINGS}~${AC.MTEF_PROJECTIONS}~${AC.AMOUNT}`} />
                <AFField
                  parent={mtefItem} className={styles.cell_3} fmPath={FMC.MTEF_PROJECTIONS_CURRENCY}
                  fieldPath={`${AC.FUNDINGS}~${AC.MTEF_PROJECTIONS}~${AC.CURRENCY}`} defaultValueAsEmptyObject />
                <AFField
                  parent={mtefItem} className={styles.cell_3} fmPath={FMC.MTEF_PROJECTIONS_DATE}
                  fieldPath={`${AC.FUNDINGS}~${AC.MTEF_PROJECTIONS}~${AC.PROJECTION_DATE}`} type={Types.DATE_YEAR}
                  extraParams={{ range, startYear, isFiscalCalendar }} />
              </div>
            </td>
            <td className={styles.delete_col}>
              <div className={styles.grid}>
                <div className={styles.cell_10}>
                  <a
                    onClick={removeMTEFItem.bind(this, mtefItem[AC.TEMPORAL_ID])}
                    className={styles.delete} href={null} title={translate('Delete')}>&nbsp;</a>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>);
  }
}

export default connect(
  state => ({
    calendar: state.startUpReducer.calendar
  })
)(AFMTEFProjectionItem);
