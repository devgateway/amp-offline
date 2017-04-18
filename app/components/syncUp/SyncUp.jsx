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
    syncUp: PropTypes.object.isRequired
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
    this.setState({ loadingSyncHistory: this.props.syncUp.loadingSyncHistory });
  }

  componentDidMount() {
    LoggerManager.log('componentDidMount');
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    LoggerManager.log('componentWillReceiveProps');
    if (this.props.syncUp.loadingSyncHistory !== nextProps.syncUp.loadingSyncHistory) {
      this.setState({ loadingSyncHistory: this.props.syncUp.loadingSyncHistory });
    }
  }

  routerWillLeave() {
    LoggerManager.log('routerWillLeave');
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this.props.syncUp.forceSyncUp;
  }

  selectContentElementToDraw(historyData) {
    LoggerManager.log('selectContentElementToDraw');
    if (this.props.syncUp.loadingSyncHistory === true || this.props.syncUp.syncUpInProgress === true) {
      return <Loading/>;
    } else {
      const showErrors = this.props.syncUp.errorMessage !== '' || this.props.syncUp.forceSyncUpMessage !== '';
      if (showErrors) {
        let error;
        let warn;
        if (this.props.syncUp.errorMessage !== '') {
          error = <ErrorMessage message={this.props.syncUp.errorMessage}/>;
        }
        if (this.props.syncUp.forceSyncUpMessage !== '') {
          warn = <WarnMessage message={this.props.syncUp.forceSyncUpMessage}/>;
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
    const { historyData } = this.props.syncUp;
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button" text="Start Sync Up"
            className={`btn btn-success ${(this.props.syncUp.loadingSyncHistory || this.props.syncUp.syncUpInProgress
              ? 'disabled' : '')}`}
            onClick={() => {
              startSyncUp();
            }}
          />
        </div>
        <div className={styles.display_inline}>
          <div
            className={(this.props.syncUp.loadingSyncHistory || this.props.syncUp.syncUpInProgress)
              ? styles.loader : ''}/>
        </div>
        <hr/>
        {this.selectContentElementToDraw(historyData)}

        <SyncUpProgressDialogModal show={this.props.syncUp.syncUpInProgress} onClick={this.cancelSync}/>
      </div>
    );
  }
}
