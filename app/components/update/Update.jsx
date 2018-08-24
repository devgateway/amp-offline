import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import translate from '../../utils/translate';
import ConnectivityStatus from '../../modules/connectivity/ConnectivityStatus';
import InProgress from '../common/InProgress';
import NotificationHelper from '../../modules/helpers/NotificationHelper';
import SimpleNotification from '../common/SimpleNotification';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Update screen to download the installer and proceed with the update
 *
 * @author Nadejda Mandrescu
 */
export default class Update extends Component {
  static propTypes = {
    errorMessage: PropTypes.oneOfType([PropTypes.instanceOf(NotificationHelper), PropTypes.string]),
    downloadingUpdate: PropTypes.bool.isRequired,
    downloadedUpdate: PropTypes.bool.isRequired,
    installingUpdate: PropTypes.bool.isRequired,
    installUpdateFailed: PropTypes.bool.isRequired,
    dismissUpdate: PropTypes.func.isRequired,
    downloadUpdate: PropTypes.func.isRequired,
    progressData: PropTypes.object,
    connectivityStatus: PropTypes.instanceOf(ConnectivityStatus).isRequired
  };

  static renderError(errorMessage) {
    return errorMessage instanceof NotificationHelper ?
      <SimpleNotification notification={errorMessage} /> : <ErrorMessage message={errorMessage} />;
  }

  constructor(props) {
    super(props);
    this.state = { errorMessage: undefined };
  }

  componentWillMount() {
    const { id } = this.props.connectivityStatus.latestAmpOffline;
    this.props.downloadUpdate(id);
  }

  componentWillUnmount() {
    this.props.dismissUpdate();
  }

  getFileDownloadProgress() {
    const { downloadingUpdate, downloadedUpdate, installingUpdate, progressData } = this.props;
    if (downloadedUpdate || installingUpdate) {
      return <div>{`${translate('downloadComplete')}`}</div>;
    }
    if (downloadingUpdate) {
      const percent = (progressData && progressData.percent) || 0;
      let progressMessage = progressData && progressData.message && progressData.message.substring(0, 100);
      progressMessage = progressMessage || translate('downloadInProgress');
      return <InProgress title={progressMessage} value={percent} />;
    }
    return <div>{translate('downloadFailed')}</div>;
  }

  getInstallerUpdateProgress() {
    const { installingUpdate, installUpdateFailed } = this.props;
    if (installingUpdate) {
      return <InProgress title={translate('updateInProgress')} />;
    }
    if (installUpdateFailed) {
      return <div>{translate('updateFailed')}</div>;
    }
    return null;
  }

  render() {
    const { errorMessage } = this.props;
    const anyErrorMessage = errorMessage || this.state.errorMessage;
    return (
      <div>
        {anyErrorMessage && Update.renderError(anyErrorMessage)}
        <Modal show={!anyErrorMessage}>
          <Modal.Header>
            <Modal.Title>{translate('updateInProgress')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div>{translate('dontStopUpdateWarning')}</div>
            {this.getFileDownloadProgress()}
            {this.getInstallerUpdateProgress()}
          </Modal.Body>
        </Modal>
      </div>);
  }
}
