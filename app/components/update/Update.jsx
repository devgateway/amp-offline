import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import translate from '../../utils/translate';
import ConnectivityStatus from '../../modules/connectivity/ConnectivityStatus';
import ErrorMessage from '../common/ErrorMessage';
import InProgress from '../common/InProgress';

/**
 * Update screen to download the installer and proceed with the update
 *
 * @author Nadejda Mandrescu
 */
export default class Update extends Component {
  static propTypes = {
    errorMessage: PropTypes.string,
    downloadingUpdate: PropTypes.bool.isRequired,
    downloadedUpdate: PropTypes.bool.isRequired,
    installingUpdate: PropTypes.bool.isRequired,
    installUpdateFailed: PropTypes.bool.isRequired,
    dismissUpdate: PropTypes.func.isRequired,
    downloadUpdate: PropTypes.func.isRequired,
    progressData: PropTypes.object,
    connectivityStatus: PropTypes.instanceOf(ConnectivityStatus).isRequired
  };

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
    const { downloadingUpdate, downloadedUpdate, installingUpdate } = this.props;
    if (downloadedUpdate || installingUpdate) {
      return <div>{`${translate('downloadComplete')}`}</div>;
    }
    if (downloadingUpdate) {
      return <InProgress title={translate('downloadInProgress')} value={this.getProgressPercentage()} />;
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

  getProgressPercentage() {
    return (this.props.progressData && this.props.progressData.percent) || 100;
  }

  render() {
    const { errorMessage, progressData } = this.props;
    const progressMessage = progressData && progressData.message && progressData.message.substring(0, 50);
    const anyErrorMessage = errorMessage || this.state.errorMessage;
    return (
      <div>
        {anyErrorMessage && <ErrorMessage message={anyErrorMessage} />}
        <Modal show={!anyErrorMessage}>
          <Modal.Header>
            <Modal.Title>{translate('updateInProgress')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div>{translate('dontStopUpdateWarning')}</div>
            <div>{progressMessage}</div>
            {this.getFileDownloadProgress()}
            {this.getInstallerUpdateProgress()}
          </Modal.Body>
        </Modal>
      </div>);
  }
}
