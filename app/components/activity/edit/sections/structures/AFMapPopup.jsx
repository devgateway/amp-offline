/* eslint-disable camelcase */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import PossibleValuesManager from '../../../../../modules/field/PossibleValuesManager';
import styles from './AFMapWindow.css';

const logger = new Logger('Map Modal');
const SQUARE = 25;

/**
 * Map Title Popup
 *
 * @author Gabriel Inchauspe
 */
export default class AFMapPopup extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.object
  };

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    layer: PropTypes.object,
    structureData: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleDeleteBtnClick = this.handleDeleteBtnClick.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.state = {
      [AC.STRUCTURES_TITLE]: (this.props.structureData ? this.props.structureData[AC.STRUCTURES_TITLE] : ''),
      [AC.STRUCTURES_DESCRIPTION]: this.props.structureData ? this.props.structureData[AC.STRUCTURES_DESCRIPTION] : '',
      [AC.STRUCTURES_COLOR]: (this.props.structureData ? this.props.structureData[AC.STRUCTURES_COLOR] : null),
      [AC.STRUCTURES_SHAPE]: this.props.structureData ? this.props.structureData[AC.STRUCTURES_SHAPE] : null,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.structureData) {
      this.setState({
        [AC.STRUCTURES_TITLE]: newProps.structureData[AC.STRUCTURES_TITLE],
        [AC.STRUCTURES_COLOR]: newProps.structureData[AC.STRUCTURES_COLOR],
        isNew: (!newProps.structureData[AC.STRUCTURES_TITLE]),
        [AC.STRUCTURES_DESCRIPTION]: newProps.structureData[AC.STRUCTURES_DESCRIPTION],
        [AC.STRUCTURES_SHAPE]: newProps.structureData[AC.STRUCTURES_SHAPE],
        isGazetteer: newProps.structureData.isGazetteer
      });
    } else {
      this.setState({
        [AC.STRUCTURES_TITLE]: '',
        [AC.STRUCTURES_COLOR]: null,
        isNew: true,
        [AC.STRUCTURES_DESCRIPTION]: ''
      });
    }
  }

  handleCancel() {
    const { layer } = this.props;
    this.setState({ [AC.STRUCTURES_TITLE]: '', [AC.STRUCTURES_COLOR]: null, [AC.STRUCTURES_DESCRIPTION]: '' });
    const del = this.state.isNew;
    this.props.onCancel(layer, del);
  }

  handleSaveBtnClick() {
    const { onSubmit, structureData, layer } = this.props;
    if (this.state[AC.STRUCTURES_TITLE]) {
      onSubmit((layer.layer || layer), structureData.id, this.state[AC.STRUCTURES_TITLE],
        this.state[AC.STRUCTURES_COLOR], this.state[AC.STRUCTURES_DESCRIPTION], this.state[AC.STRUCTURES_SHAPE],
        this.state.isGazetteer);
    } else {
      alert(translate('emptyTitle'));
    }
  }

  handleDeleteBtnClick() {
    const { layer, structureData } = this.props;
    this.props.onDelete(layer, structureData);
  }

  handleChangeTitle(obj) {
    this.setState({ [AC.STRUCTURES_TITLE]: obj.target.value });
  }

  handleChangeColor(id, colors) {
    const newColor = PossibleValuesManager.findOption(colors, id);
    this.setState({ [AC.STRUCTURES_COLOR]: newColor });
  }

  generateColorList() {
    const { structure_color } = this.state;
    const content = [];
    const colors = this.context.activityFieldsManager.possibleValuesMap[`${AC.STRUCTURES}~${AC.STRUCTURES_COLOR}`];
    Object.values(colors).forEach(c => {
      const color = c.value.substring(0, 7);
      const text = c.value.substring(8);
      content.push(<div key={Math.random()} className={styles.colors}>
        <input
          type="radio" name="color" value={c.id} checked={(structure_color && structure_color.id === c.id)}
          onChange={this.handleChangeColor.bind(null, c.id, colors)} className={styles.colorItem} />
        <svg width={SQUARE} height={SQUARE}>
          <rect width={SQUARE} height={SQUARE} style={{ fill: color, x: 5, y: 5 }} />
        </svg>
        <span className={styles.colorItem}>{text}</span>
      </div>);
    });
    return (<div key={Math.random()} className={styles.color_container}>
      <span className={styles.label}>{translate('Select a color')}</span>
      <div>{content}</div>
    </div>);
  }

  render() {
    const { title, shape, isGazetteer } = this.state;
    return (<Modal show={this.props.show} bsSize="small">
      <Modal.Header>
        <Modal.Title>
          {translate('Select Structure')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span className={styles.label}>{translate('Title')}</span>
        <input
          type={'text'} value={title} onChange={this.handleChangeTitle} disabled={isGazetteer}
          className="form-control" />
        {shape !== AC.STRUCTURES_POINT ? this.generateColorList() : null}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.handleSaveBtnClick} bsStyle="success">
          {isGazetteer ? translate('Select') : translate('Submit')}
        </Button>
        {!this.state.isNew && !this.state.isGazetteer
          ? (<Button onClick={this.handleDeleteBtnClick} bsStyle="danger">
            {translate('Delete')}
          </Button>)
          : null}
        <Button onClick={this.handleCancel}>
          {translate('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
