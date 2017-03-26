import React, { Component, PropTypes } from 'react';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';
import SyncUpManager from '../../modules/syncup/SyncUpManager';

export default class SyncUp extends Component {
  static propTypes = {
    getSyncUpHistory: PropTypes.func.isRequired,
    startSyncUp: PropTypes.func.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
    this.state = {
      errorMessage: '',
      syncUpInProgress: false,
      loadingSyncHistory: false,
      firstLoadSyncUp: true,
      forceSyncUp: false
    };

    this.selectContentElementToDraw.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount');
    // TODO: this might change once we have the final layout for the syncupPage
    this.props.getSyncUpHistory();
    this.state.firstLoadSyncUp = false;
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this));
    SyncUpManager.isForceSyncUp().then((force) => (this.state.forceSyncUp = force));
  }

  routerWillLeave(nextLocation) {
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this.state.forceSyncUp;
    // TODO: mostrar warning o error para que el usuario sepa.
  }

  selectContentElementToDraw(historyData) {
    if (this.state.loadingSyncHistory !== false || this.state.firstLoadSyncUp === true) {
      return <Loading/>;
    } else {
      if (this.state.errorMessage !== '') {
        return <ErrorMessage message={this.state.errorMessage}/>;
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

  render() {
    console.log('render');
    console.log(this.props);
    const { startSyncUp } = this.props;
    const { historyData } = this.props.syncUp;

    this.state.errorMessage = this.props.syncUp.errorMessage || '';
    this.state.loadingSyncHistory = this.props.syncUp.loadingSyncHistory;
    this.state.syncUpInProgress = this.props.syncUp.syncUpInProgress;
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button" text="Start Sync Up"
            className={`btn btn-success ${(this.state.loadingSyncHistory ? 'disabled' : '')}`}
            onClick={() => {
              startSyncUp(historyData);
            }}
          />
        </div>
        <div className={styles.display_inline}>
          <div className={+this.state.syncUpInProgress ? styles.loader : ''}/>
        </div>
        <hr/>
        {this.selectContentElementToDraw(historyData)}
      </div>
    );
  }
}
