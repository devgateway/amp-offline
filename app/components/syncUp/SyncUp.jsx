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

    this.selectContentElementToDraw.bind(this);
  }

  componentWillMount() {
    LoggerManager.log('componentWillMount');
    // To avoid the 'no-did-mount-set-state' eslint error.
    this.setState({ firstLoadSyncUp: false });
    this.setState({ loadingSyncHistory: this.props.syncUpReducer.loadingSyncHistory });
  }

  componentDidMount() {
    LoggerManager.log('componentDidMount');
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    LoggerManager.log('componentWillReceiveProps');
    if (this.props.syncUpReducer.loadingSyncHistory !== nextProps.syncUpReducer.loadingSyncHistory) {
      this.setState({ loadingSyncHistory: this.props.syncUpReducer.loadingSyncHistory });
    }
  }

  routerWillLeave() {
    LoggerManager.log('routerWillLeave');
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this.props.syncUpReducer.forceSyncUp;
  }

  selectContentElementToDraw(historyData) {
    LoggerManager.log('selectContentElementToDraw');
    if (this.props.syncUpReducer.loadingSyncHistory === true || this.props.syncUpReducer.syncUpInProgress === true) {
      return <Loading/>;
    } else {
      const showErrors = this.props.syncUpReducer.errorMessage !== '' || this.props.syncUpReducer.forceSyncUpMessage !== '';
      if (showErrors) {
        let error;
        let warn;
        if (this.props.syncUpReducer.errorMessage !== '') {
          error = <ErrorMessage message={this.props.syncUpReducer.errorMessage}/>;
        }
        if (this.props.syncUpReducer.forceSyncUpMessage !== '') {
          warn = <WarnMessage message={this.props.syncUpReducer.forceSyncUpMessage}/>;
        }
        return (<div>{ error }{ warn }</div>);
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

  cancelSync() {
    LoggerManager.log('cancelSync');
    alert('To be implemented on AMPOFFLINE-208');
  }

  render() {
    LoggerManager.log('render');
    const { startSyncUp } = this.props;
    const { historyData } = this.props.syncUpReducer;
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button" text="Start Sync Up"
            className={`btn btn-success ${(this.props.syncUpReducer.loadingSyncHistory || this.props.syncUpReducer.syncUpInProgress
              ? 'disabled' : '')}`}
            onClick={() => {
              startSyncUp();
            }}
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
