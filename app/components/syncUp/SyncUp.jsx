/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import WarnMessage from '../common/WarnMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';

export default class SyncUp extends Component {

  static propTypes = {
    startSyncUp: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    syncUp: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');

    this.selectContentElementToDraw.bind(this);
  }

  componentWillMount() {
    console.log('componentWillMount');
    // To avoid the 'no-did-mount-set-state' eslint error.
    this.setState({ firstLoadSyncUp: false });
    this.setState({ loadingSyncHistory: this.props.syncUp.loadingSyncHistory });
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    if (this.props.syncUp.loadingSyncHistory !== nextProps.syncUp.loadingSyncHistory) {
      this.setState({ loadingSyncHistory: this.props.syncUp.loadingSyncHistory });
    }
  }

  routerWillLeave() {
    console.log('routerWillLeave');
    // FFR: https://github.com/ReactTraining/react-router/blob/v3/docs/guides/ConfirmingNavigation.md
    return !this.props.syncUp.forceSyncUp;
  }

  selectContentElementToDraw(historyData) {
    console.log('selectContentElementToDraw');
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

  render() {
    console.log('render');
    console.log(this.props);
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
      </div>
    );
  }
}
