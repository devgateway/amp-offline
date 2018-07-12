import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import * as AC from '../../../../../utils/constants/ActivityConstants';

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
      [AC.STRUCTURES_TITLE]: (this.props.structureData ? this.props.structureData[AC.STRUCTURES_TITLE] : ''),
      [AC.STRUCTURES_DESCRIPTION]: this.props.structureData ? this.props.structureData[AC.STRUCTURES_DESCRIPTION] : '',
      color: (this.props.structureData ? this.props.structureData.color : null)
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.structureData) {
      this.setState({
        [AC.STRUCTURES_TITLE]: newProps.structureData[AC.STRUCTURES_TITLE],
        color: newProps.structureData.color,
        isNew: (!newProps.structureData[AC.STRUCTURES_TITLE]),
        [AC.STRUCTURES_DESCRIPTION]: newProps.structureData[AC.STRUCTURES_DESCRIPTION],
      });
    } else {
      this.setState({ [AC.STRUCTURES_TITLE]: '', color: null, isNew: true, [AC.STRUCTURES_DESCRIPTION]: '' });
    }
  }

  handleCancel(layer) {
    this.setState({ [AC.STRUCTURES_TITLE]: '', color: null, [AC.STRUCTURES_DESCRIPTION]: '' });
    const del = this.state.isNew;
    this.props.onCancel(layer, del);
  }

  handleSaveBtnClick(layer) {
    const { onSubmit, structureData } = this.props;
    if (this.state[AC.STRUCTURES_TITLE]) {
      onSubmit((layer.layer || layer), structureData.id, this.state[AC.STRUCTURES_TITLE], this.state.color
        , this.state[AC.STRUCTURES_DESCRIPTION]);
    } else {
      alert(translate('emptyTitle'));
    }
  }

  handleChange(obj) {
    this.setState({ [AC.STRUCTURES_TITLE]: obj.target.value });
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
