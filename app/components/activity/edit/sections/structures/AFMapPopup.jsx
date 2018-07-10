import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';

const logger = new Logger('Map Modal');

/**
 * Map Title Popup
 *
 * @author Gabriel Inchauspe
 */
export default class AFMapPopup extends Component {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    layer: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSaveBtnClick(layer) {
    const { onSubmit } = this.props;
    onSubmit(layer, this.state.title);
  }

  handleChange(obj) {
    this.setState({ title: obj.target.value });
  }

  render() {
    const { onCancel, layer } = this.props;
    return (<Modal show={this.props.show} bsSize="small">
      <Modal.Header>
        <Modal.Title>
          {translate('Select Structure')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {translate('Title')} <input type={'text'} onChange={this.handleChange} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.handleSaveBtnClick.bind(null, layer)} bsStyle="success">
          {translate('Submit')}
        </Button>
        <Button onClick={onCancel.bind(null, layer)}>
          {translate('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
