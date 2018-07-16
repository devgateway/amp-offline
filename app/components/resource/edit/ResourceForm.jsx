import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar, Col, FormGroup, Grid, Row } from 'react-bootstrap';
import Logger from '../../../modules/util/LoggerManager';
import * as RC from '../../../utils/constants/ResourceConstants';
import AFField from '../../activity/edit/components/AFField';
import FieldsManager from '../../../modules/field/FieldsManager';
import EntityValidator from '../../../modules/field/EntityValidator';
import { ALWAYS_REQUIRED, TMP_ENTITY_VALIDATOR } from '../../../utils/constants/ValueConstants';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import translate from '../../../utils/translate';
import { FIELD_REQUIRED } from '../../../utils/constants/FieldPathConstants';


const logger = new Logger('ResourceForm');
// columns size
const CS = 4;

/**
 * Resource Form
 *
 * @author Nadejda Mandrescu
 */
export default class ResourceForm extends Component {
  static contextTypes = {
    activity: PropTypes.object,
    isSaveAndSubmit: PropTypes.bool.isRequired,
  };

  static propTypes = {
    resourceReducer: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onAdd: PropTypes.func,
    onCancel: PropTypes.func,
    updatePendingWebResource: PropTypes.func.isRequired,
    updatePendingDocResource: PropTypes.func.isRequired,
    prepareNewResourceForSave: PropTypes.func.isRequired,
  };

  static childContextTypes = {
    activity: PropTypes.object,
    isSaveAndSubmit: PropTypes.bool.isRequired,
    validationResult: PropTypes.array,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(EntityValidator),
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.isDoc = props.type === RC.TYPE_DOC_RESOURCE;
    this.updateFunc = this.isDoc ? props.updatePendingDocResource : props.updatePendingWebResource;
  }

  getChildContext() {
    const { resource, resourceReducer } = this.props;
    return {
      activity: this.context.activity,
      isSaveAndSubmit: false,
      validationResult: resource.errors,
      activityFieldsManager: resourceReducer.resourceFieldsManager,
      activityValidator: resource && resource[TMP_ENTITY_VALIDATOR],
    };
  }

  componentDidMount() {
    this.updateFunc(this.props.resource);
  }

  onAdd() {
    const { onAdd, prepareNewResourceForSave, resource } = this.props;
    prepareNewResourceForSave(resource);
    const errors = this.validate();
    if (errors.length) {
      const msg = errors.map(e => `[${e.path}]: ${e.errorMessage}`).join(' ');
      logger.error(`Resource validation errors: ${msg}`);
      this.updateFunc(Object.assign({}, resource));
    } else if (onAdd) {
      onAdd(resource);
    }
  }

  // eslint-disable-next-line react/sort-comp
  validate() {
    const { resource, resourceReducer } = this.props;
    const errors = resource[TMP_ENTITY_VALIDATOR].areAllConstraintsMet(resource);
    // workaround as a custom validation, since no dependency logic available yet
    if (this.isDoc) {
      // TODO
    } else {
      const webLinkDef = { ...resourceReducer.resourceFieldsManager.getFieldDef(RC.WEB_LINK) };
      webLinkDef[FIELD_REQUIRED] = ALWAYS_REQUIRED;
      errors.push(...resource[TMP_ENTITY_VALIDATOR].validateField(resource, false, webLinkDef, RC.WEB_LINK));
    }
    return errors;
  }

  onCancel() {
    this.updateFunc(null);
    if (this.props.onCancel) {
      this.props.onCancel(this.props.type);
    }
  }

  getLink() {
    return (
      <Col lg={CS} md={CS}>
        <AFField fieldPath={RC.WEB_LINK} parent={this.props.resource} type={Types.INPUT_TYPE} />
      </Col>
    );
  }

  getFileUpload() {
    return 'TODO';
  }

  render() {
    const { resource } = this.props;
    return (
      <FormGroup>
        <Grid>
          <Row key="main-def">
            <Col lg={CS} md={CS}>
              <AFField fieldPath={RC.TITLE} parent={resource} type={Types.INPUT_TYPE} />
            </Col>
            <Col lg={CS} md={CS}>
              <AFField fieldPath={RC.TYPE} parent={resource} />
            </Col>
          </Row>
          <Row key="details">
            <Col lg={CS} md={CS}>
              <AFField fieldPath={RC.DESCRIPTION} parent={resource} type={Types.TEXT_AREA} />
            </Col>
            <Col lg={CS} md={CS}>
              <AFField fieldPath={RC.NOTE} parent={resource} type={Types.TEXT_AREA} />
            </Col>
          </Row>
          <Row key="actual-resource">
            {this.isDoc ? this.getFileUpload() : this.getLink()}
          </Row>
          <Row key="action-buttons">
            <Col lg={2 * CS} md={2 * CS}>
              <ButtonToolbar>
                <Button key="add" bsStyle="success" onClick={this.onAdd.bind(this)}>
                  {translate('Add')}
                </Button>
                <Button key="cancel" bsStyle="success" onClick={this.onCancel.bind(this)}>
                  {translate('Cancel')}
                </Button>
              </ButtonToolbar>
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }
}
