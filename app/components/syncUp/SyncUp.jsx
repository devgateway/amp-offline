// @flow
import React, {Component, PropTypes} from 'react';
import styles from './SyncUp.css';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import Button from '../i18n/Button';

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
      firstLoadSyncUp: true
    };

    this.selectContentElementToDraw.bind(this);

    /*this.handleEmailChange = this.handleEmailChange.bind(this);
     this.handlePasswordChange = this.handlePasswordChange.bind(this);*/
  }

  componentDidMount() {
    console.log('componentDidMount');
    //TODO this might change once we have the final layout for the syncupPage
    this.props.getSyncUpHistory();
    this.state.firstLoadSyncUp = false;
  }

  render() {
    console.log('render');
    console.log(this.props);
    const {startSyncUp} = this.props;
    const {historyData}= this.props.syncUp;

    this.state.errorMessage = this.props.syncUp.errorMessage || '';
    this.state.loadingSyncHistory = this.props.syncUp.loadingSyncHistory;
    this.state.syncUpInProgress = this.props.syncUp.syncUpInProgress;
    return (
      <div className={styles.container}>
        <div className={styles.display_inline}>
          <Button type="button"  text="Start Sync Up" className={'btn btn-success ' + (this.state.loadingSyncHistory ? 'disabled' : '')}
                  onClick={() => {
            startSyncUp(historyData,this.props.login.loggedUser.token)
          }} >
          </Button>
        </div>
        <div className={styles.display_inline}>
          <div className={ + this.state.syncUpInProgress? styles.loader : ''}>
          </div>
        </div>
        <hr/>
        {this.selectContentElementToDraw(historyData)}
      </div>
    );
  }

  selectContentElementToDraw(historyData) {

    if (this.state.loadingSyncHistory !== false || this.state.firstLoadSyncUp === true) {
      return <Loading/>;
    } else {
      if (this.state.errorMessage !== '') {
        return <ErrorMessage message={this.state.errorMessage}/>;
      } else {
        return <div className={'container'}>
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
        </div>
      }
    }
  }

  /*
   handlePasswordChange(e) {
   this.setState({password: e.target.value});
   }

   handleEmailChange(e) {
   this.setState({email: e.target.value});
   }*/
}
