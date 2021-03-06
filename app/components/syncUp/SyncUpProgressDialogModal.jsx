import React, { Component, PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
// import Button from '../i18n/Button';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

const logger = new Logger('Syncup progress dialog modal');

export default class SyncUpProgressDialogModal extends Component {

  static propTypes = {
    show: PropTypes.bool.isRequired
    /* onClick: PropTypes.func.isRequired */
  };

  render() {
    logger.log('render');
    return (
      <div className="static-modal">
        <Modal show={this.props.show}>
          <Modal.Header>
            <Modal.Title>{translate('Synchronize')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {translate('dontStopSyncWarning')}
          </Modal.Body>

          {/* <Modal.Footer>
           <Button
           className="btn btn-primary"
           text={translate('Cancel')}
           onClick={() => (this.props.onClick())} />
           </Modal.Footer> */}
        </Modal>
      </div>
    );
  }
}
