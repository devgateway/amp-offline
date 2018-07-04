import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import AFInput from '../../components/AFInput';
import * as Utils from '../../../../../utils/Utils';

const logger = new Logger('Map Modal');

/**
 * Map Modal
 *
 * @author Gabriel Inchauspe
 */
export default class AFMapWindow extends Component {
  static propTypes = {
    onModalClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
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
    return (<Modal show={this.props.show}>
      <Modal.Header>
        <Modal.Title>
          {translate('Structures')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AFInput value={this.state.value} onChange={this.handleChange.bind(this)} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.handleSaveBtnClick.bind(this)} bsStyle="success">
          {translate('Save')}
        </Button>
        <Button onClick={onModalClose}>
          {translate('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
