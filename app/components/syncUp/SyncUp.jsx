/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import WarnMessage from '../common/WarnMessage';
import InfoMessage from '../common/InfoMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';
import LoggerManager from '../../modules/util/LoggerManager';
import SyncUpProgressDialogModal from './SyncUpProgressDialogModal';
import translate from '../../utils/translate';
import { SYNCUP_STATUS_SUCCESS, SYNCUP_STATUS_FAIL } from '../../utils/Constants';

// opposite of `pluck`, provided an object, returns a function that accepts a string
// and returns the corresponding field of that object
const valuesOf = obj => field => obj[field];

// accepts a string:boolean map and concats the keys with truthy values into a string that can be passed to `classNames`
const classes = rules => Object.keys(rules).filter(valuesOf(rules)).join(' ');

export default class SyncUp extends Component {

  static propTypes = {
    startSyncUp: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    syncUpReducer: PropTypes.object.isRequired,
    getSyncUpHistory: PropTypes.func.isRequired
  };

  static cancelSync() {
    LoggerManager.log('cancelSync');
    LoggerManager.log('To be implemented on AMPOFFLINE-208');
  }

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  componentWillMount() {
    LoggerManager.log('componentWillMount');
    this.props.getSyncUpHistory();
  }

  componentDidMount() {
    LoggerManager.log('componentDidMount');
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this));
  }

  componentWillReceiveProps() {
    LoggerManager.log('componentWillReceiveProps');
  }

  routerWillLeave() {
    LoggerManager.log('routerWillLeave');
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this.props.syncUpReducer.forceSyncUp;
  }

  selectContentElementToDraw(historyData) {
    LoggerManager.log('selectContentElementToDraw');
    const { syncUpReducer } = this.props;
    if (this.props.syncUpReducer.loadingSyncHistory === true || this.props.syncUpReducer.syncUpInProgress === true) {
      return <Loading />;
    } else {
      const { errorMessage, forceSyncUpMessage } = syncUpReducer;
      if (errorMessage || forceSyncUpMessage) {
        return (
          <div>
            {errorMessage && <ErrorMessage message={errorMessage} />}
            {forceSyncUpMessage && <WarnMessage message={forceSyncUpMessage} />}
          </div>
        );
      } else if (historyData) {
        if (historyData.status === SYNCUP_STATUS_SUCCESS) {
          const message = translate('Last successful sync up was was done on $date$')
            .replace('$date$', new Date(historyData['sync-date']).toLocaleString());

          return (
            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                  <InfoMessage type="success" message={message} />
                </div>
              </div>
            </div>
          );
        } else if (historyData.status === SYNCUP_STATUS_FAIL) {
          return (
            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                  <WarnMessage message={translate('All previous sync up failed.')} />
                </div>
              </div>
            </div>
          );
        }
      } else {
        return (
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <ErrorMessage
                  message={translate('Please sync prior to working with the app for the latest data and avoid ' +
                    'version conflicts when uploading data')}
                />
              </div>
            </div>
          </div>
        );
      }
    }
  }

  render() {
    LoggerManager.log('render');
    const { startSyncUp, syncUpReducer } = this.props;
    const { historyData, loadingSyncHistory, syncUpInProgress } = syncUpReducer;
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button"
            text="Start Sync Up"
            className={classes({
                'btn btn-success': true,
                disabled: loadingSyncHistory || syncUpInProgress
            })}
            onClick={startSyncUp}
          />
        </div>
        <div className={styles.display_inline}>
          <div className={classes({ [styles.loader]: loadingSyncHistory || syncUpInProgress })} />
        </div>
        <hr />
        {this.selectContentElementToDraw(historyData[0])}

        <SyncUpProgressDialogModal show={this.props.syncUpReducer.syncUpInProgress} onClick={SyncUp.cancelSync} />
      </div>
    );
  }
}
