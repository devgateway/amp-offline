import React, { Component, PropTypes } from 'react';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { IDENTIFICATION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Identification Section
 * @author Nadejda Mandrescu
 */
class AFIdentification extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (
      <table className={afStyles.full_width}>
        <tbody>
          <tr>
            <td colSpan={2}>
              <AFField parent={this.props.activity} fieldPath={AC.PROJECT_TITLE} />
            </td>
          </tr>
          <tr>
            <td>
              <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_STATUS} />
            </td>
            <td>
              <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_BUDGET} />
            </td>
          </tr>
        </tbody>
      </table>);
  }
}

export default AFSection(AFIdentification, IDENTIFICATION);
