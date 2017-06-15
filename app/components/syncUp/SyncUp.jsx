/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import WarnMessage from '../common/WarnMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';
import LoggerManager from '../../modules/util/LoggerManager';
import SyncUpProgressDialogModal from './SyncUpProgressDialogModal';

export default class SyncUp extends Component {

  static propTypes = {
    startSyncUp: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    syncUpReducer: PropTypes.object.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  componentWillMount() {
    LoggerManager.log('componentWillMount');
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
      return <Loading/>;
    } else {
      const { errorMessage, forceSyncUpMessage } = syncUpReducer;
      if (errorMessage || forceSyncUpMessage) {
        return (
          <div>
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            {forceSyncUpMessage && <WarnMessage message={forceSyncUpMessage}/>}
          </div>
        );
      } else {
        return (<div className={'container'}>
          <div className={'row'}>
            <div className={'col-sm-4'}>
              Requested Date:
            </div>
            <div className={'col-sm-4'}>{historyData['requested-date']}</div>
          </div>
          <div className={'row'}>
            <div className={'col-sm-4'}>status</div>
            <div className={'col-sm-4'}>{historyData.status}</div>
          </div>
        </div>);
      }
    }
  }

  cancelSync () {
    LoggerManager.log('cancelSync');
    alert('To be implemented on AMPOFFLINE-208');
  }

  render() {
    LoggerManager.log('render');
    const { startSyncUp, syncUpReducer } = this.props;
    const { historyData, loadingSyncHistory, syncUpInProgress } = syncUpReducer;
    const buttonClasses = ['btn', 'btn-success'];
    if (loadingSyncHistory || syncUpInProgress) buttonClasses.push('disabled');
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button"
            text="Start Sync Up"
            className={buttonClasses.join(' ')}
            onClick={() => startSyncUp()}
          />
        </div>
        <div className={styles.display_inline}>
          <div
            className={(this.props.syncUpReducer.loadingSyncHistory || this.props.syncUpReducer.syncUpInProgress)
              ? styles.loader : ''}/>
        </div>
        <hr/>
        {this.selectContentElementToDraw(historyData)}

        <SyncUpProgressDialogModal show={this.props.syncUpReducer.syncUpInProgress} onClick={this.cancelSync}/>
      </div>
    );
  }
}
