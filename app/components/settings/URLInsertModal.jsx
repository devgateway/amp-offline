import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';
import AFTextArea from '../activity/edit/components/AFTextArea';
import * as Utils from '../../utils/Utils';

const logger = new Logger('URL Insert Modal');

// TODO make reusable, also move AF reusable components

/**
 * Custom URL Insert Modal
 *
 * @author Nadejda Mandrescu
 */
export default class URLInsertModal extends Component {
  static propTypes = {
    onModalClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      url: undefined,
      validationResult: undefined
    };
  }

  handleSaveBtnClick() {
    const { onSave } = this.props;
    const { url } = this.state;
    const newRow = { id: Utils.stringToUniqueId(url), url, availability: {} };
    onSave(newRow);
  }

  handleChange(url) {
    this.setState({ url });
  }

  render() {
    const { onModalClose } = this.props;
    return (<Modal show>
      <Modal.Header>
        <Modal.Title>
          {translate('ampServerUrl')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AFTextArea value={this.state.value} onChange={this.handleChange.bind(this)} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onModalClose}>
          {translate('Cancel')}
        </Button>
        <Button onClick={this.handleSaveBtnClick.bind(this)} bsStyle="success">
          {translate('Add')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
