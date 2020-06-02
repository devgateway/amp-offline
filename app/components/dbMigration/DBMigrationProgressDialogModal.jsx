import React, { Component, PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

const logger = new Logger('DB Migration progress dialog modal');

export default class DBMigrationProgressDialogModal extends Component {

  static propTypes = {
    show: PropTypes.bool.isRequired
  };

  render() {
    logger.log('render');
    return (
      <div className="static-modal">
        <Modal show={this.props.show}>
          <Modal.Header>
            <Modal.Title>{translate('dbMigrationModalTitle')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {translate('dbMigrationInProgressWait')}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
