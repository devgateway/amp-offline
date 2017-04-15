import React from 'react';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Identification Section
 * @author Nadejda Mandrescu
 */
export default class Identification extends AFSection {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  renderContent() {
    return (
      <table className={afStyles.full_width}>
        <tbody>
          <tr>
            <td colSpan={2}>
              <AFField parent={this.context.activity} fieldPath={AC.PROJECT_TITLE} />
            </td>
          </tr>
          <tr>
            <td>
              <AFField parent={this.context.activity} fieldPath={AC.ACTIVITY_STATUS} />
            </td>
            <td>
              <AFField parent={this.context.activity} fieldPath={AC.ACTIVITY_BUDGET} />
            </td>
          </tr>
        </tbody>
      </table>);
  }
}
