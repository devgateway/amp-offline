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
    layer: PropTypes.object,
    structureData: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.state = {
      title: (this.props.structureData ? this.props.structureData.title : ''),
      color: (this.props.structureData ? this.props.structureData.color : null)
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.structureData) {
      this.setState({
        title: newProps.structureData.title,
        color: newProps.structureData.color,
        isNew: (!newProps.structureData.title)
      });
    } else {
      this.setState({ title: '', color: null, isNew: true });
    }
  }

  handleCancel(layer) {
    this.setState({ title: '' });
    const del = this.state.isNew;
    this.props.onCancel(layer, del);
  }

  handleSaveBtnClick(layer) {
    const { onSubmit, structureData } = this.props;
    if (this.state.title) {
      onSubmit((layer.layer || layer), structureData.id, this.state.title, this.state.color);
    } else {
      alert(translate('emptyTitle'));
    }
  }

  handleChange(obj) {
    this.setState({ title: obj.target.value });
  }

  render() {
    const { layer } = this.props;
    const { title } = this.state;
    return (<Modal show={this.props.show} bsSize="small">
      <Modal.Header>
        <Modal.Title>
          {translate('Select Structure')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {translate('Title')}
        <input type={'text'} value={title} onChange={this.handleChange} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.handleSaveBtnClick.bind(null, layer)} bsStyle="success">
          {translate('Submit')}
        </Button>
        <Button onClick={this.handleCancel.bind(null, layer)}>
          {translate('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
