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
    fullUpdateFileName: PropTypes.string,
    downloadingUpdate: PropTypes.bool.isRequired,
    downloadedUpdate: PropTypes.bool.isRequired,
    installingUpdate: PropTypes.bool.isRequired,
    installUpdateFailed: PropTypes.bool.isRequired,
    dismissUpdate: PropTypes.func.isRequired,
    downloadUpdate: PropTypes.func.isRequired,
    installUpdate: PropTypes.func.isRequired,
    connectivityStatus: PropTypes.instanceOf(ConnectivityStatus).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const { id } = this.props.connectivityStatus.latestAmpOffline;
    this.props.downloadUpdate(id);
  }

  componentWillReceiveProps(nextProps) {
    const { fullUpdateFileName, downloadedUpdate, installingUpdate, installUpdateFailed, installUpdate } = nextProps;
    if (fullUpdateFileName && downloadedUpdate && !installingUpdate && !installUpdateFailed) {
      installUpdate(fullUpdateFileName);
    }
  }

  componentWillUnmount() {
    this.props.dismissUpdate();
  }

  getFileDownloadProgress() {
    const { fullUpdateFileName, downloadingUpdate, downloadedUpdate } = this.props;
    if (fullUpdateFileName && downloadedUpdate) {
      return <div>{`${translate('downloadComplete')}: ${fullUpdateFileName}`}</div>;
    }
    if (downloadingUpdate) {
      return <InProgress title={translate('downloadInProgress')} />;
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
    return (
      <div>
        {errorMessage && <ErrorMessage message={errorMessage} />}
        <Modal show={!errorMessage}>
          <Modal.Header>
            <Modal.Title>{translate('updateInProgress')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {translate('dontStopUpdateWarning')}
            {this.getFileDownloadProgress()}
            {this.getInstallerUpdateProgress()}
          </Modal.Body>
        </Modal>
      </div>);
  }
}
