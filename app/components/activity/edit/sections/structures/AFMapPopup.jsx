/* eslint-disable camelcase */
/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { ActivityConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import PossibleValuesManager from '../../../../../modules/field/PossibleValuesManager';
import AFLabel from '../../components/AFLabel';
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
    logger.debug('constructor');
    this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleDeleteBtnClick = this.handleDeleteBtnClick.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.state = {
      [ActivityConstants.STRUCTURES_TITLE]: (this.props.structureData ?
        this.props.structureData[ActivityConstants.STRUCTURES_TITLE] : ''),
      [ActivityConstants.STRUCTURES_DESCRIPTION]: this.props.structureData ?
        this.props.structureData[ActivityConstants.STRUCTURES_DESCRIPTION] : '',
      [ActivityConstants.STRUCTURES_COLOR]: (this.props.structureData ?
        this.props.structureData[ActivityConstants.STRUCTURES_COLOR] : null),
      [ActivityConstants.STRUCTURES_SHAPE]: this.props.structureData ?
        this.props.structureData[ActivityConstants.STRUCTURES_SHAPE] : null,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.structureData) {
      this.setState({
        [ActivityConstants.STRUCTURES_TITLE]: newProps.structureData[ActivityConstants.STRUCTURES_TITLE],
        [ActivityConstants.STRUCTURES_COLOR]: newProps.structureData[ActivityConstants.STRUCTURES_COLOR],
        isNew: (!newProps.structureData[ActivityConstants.STRUCTURES_TITLE]),
        [ActivityConstants.STRUCTURES_DESCRIPTION]: newProps.structureData[ActivityConstants.STRUCTURES_DESCRIPTION],
        [ActivityConstants.STRUCTURES_SHAPE]: newProps.structureData[ActivityConstants.STRUCTURES_SHAPE],
        isGazetteer: newProps.structureData.isGazetteer
      });
    } else {
      this.setState({
        [ActivityConstants.STRUCTURES_TITLE]: '',
        [ActivityConstants.STRUCTURES_COLOR]: null,
        isNew: true,
        [ActivityConstants.STRUCTURES_DESCRIPTION]: ''
      });
    }
  }

  componentDidUpdate() {
    if (this.refs.title) {
      this.refs.title.focus();
    }
  }

  handleCancel() {
    const { layer } = this.props;
    this.setState({ [ActivityConstants.STRUCTURES_TITLE]: '',
      [ActivityConstants.STRUCTURES_COLOR]: null,
      [ActivityConstants.STRUCTURES_DESCRIPTION]: '' });
    const del = this.state.isNew;
    this.props.onCancel(layer, del);
  }

  handleSaveBtnClick() {
    const { onSubmit, structureData, layer } = this.props;
    const title = this.state[ActivityConstants.STRUCTURES_TITLE].trim();
    if (title) {
      onSubmit((layer.layer || layer), structureData.id, structureData[ActivityConstants.TEMPORAL_ID], title,
        this.state[ActivityConstants.STRUCTURES_COLOR], this.state[ActivityConstants.STRUCTURES_DESCRIPTION],
        this.state[ActivityConstants.STRUCTURES_SHAPE],
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
    this.setState({ [ActivityConstants.STRUCTURES_TITLE]: obj.target.value });
  }

  handleChangeColor(id, colors) {
    const newColor = PossibleValuesManager.findOption(colors, id);
    this.setState({ [ActivityConstants.STRUCTURES_COLOR]: newColor });
  }

  generateColorList() {
    const { structure_color } = this.state;
    const content = [];
    const colors = this.context.activityFieldsManager
      .possibleValuesMap[`${ActivityConstants.STRUCTURES}~${ActivityConstants.STRUCTURES_COLOR}`];
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
        <AFLabel value={translate('Title')} required className={styles.label} />
        <input
          ref="title"
          type={'text'} value={title} onChange={this.handleChangeTitle} disabled={isGazetteer}
          className="form-control" />
        {shape !== ActivityConstants.STRUCTURES_POINT ? this.generateColorList() : null}
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
