/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import WarnMessage from '../common/WarnMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';

export default class SyncUp extends Component {

  static propTypes = {
    getSyncUpHistory: PropTypes.func.isRequired,
    startSyncUp: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    syncUp: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
    this.state = {
      errorMessage: '',
      warnMessage: '',
      syncUpInProgress: false,
      loadingSyncHistory: false,
      firstLoadSyncUp: true
    };

    this.selectContentElementToDraw.bind(this);
  }

  componentWillMount() {
    console.log('componentWillMount');
    // To avoid the 'no-did-mount-set-state' eslint error.
    this.setState({
      firstLoadSyncUp: false,
      errorMessage: this.props.syncUp.errorMessage || '',
      loadingSyncHistory: this.props.syncUp.loadingSyncHistory,
      syncUpInProgress: this.props.syncUp.syncUpInProgress
    });
  }

  componentDidMount() {
    console.log('componentDidMount');
    // TODO: this might change once we have the final layout for the syncupPage
    this.props.getSyncUpHistory();
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this));
  }

  routerWillLeave() {
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this._setForceSyncUpWarnMessage();
  }

  _setForceSyncUpWarnMessage() {
    if (this.props.syncUp.forceSyncUp) {
      this.setState({ warnMessage: this.props.syncUp.forceSyncUpMessage });
      return true;
    } else {
      this.setState({ warnMessage: '' });
      return false;
    }
  }

  selectContentElementToDraw(historyData) {
    if (this.state.loadingSyncHistory !== false || this.state.firstLoadSyncUp === true) {
      return <Loading/>;
    } else {
      if (this.state.errorMessage !== '') {
        return <ErrorMessage message={this.state.errorMessage}/>;
      } else if (this.state.warnMessage !== '') {
        return <WarnMessage message={this.state.warnMessage}/>;
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

    this._setForceSyncUpWarnMessage();
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button
            type="button" text="Start Sync Up"
            className={`btn btn-success ${(this.state.loadingSyncHistory ? 'disabled' : '')}`}
            onClick={() => {
              startSyncUp();
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
