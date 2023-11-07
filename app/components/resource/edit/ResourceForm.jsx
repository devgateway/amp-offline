import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar, Col, FormGroup, Grid, Row } from 'react-bootstrap';
import { ValueConstants, FieldsManager, GlobalSettingsConstants } from 'amp-ui';
import Logger from '../../../modules/util/LoggerManager';
import * as RC from '../../../utils/constants/ResourceConstants';
import AFField from '../../activity/edit/components/AFField';
import EntityValidator from '../../../modules/field/EntityValidator';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import translate from '../../../utils/translate';
import FileDialog from '../../../modules/util/FileDialog';
import FileManager from '../../../modules/util/FileManager';
import GlobalSettingsManager from '../../../modules/util/GlobalSettingsManager';
import * as resStyles from './ResourceForm.css';
import { notifyError, validate } from '../../../actions/ResourceAction';

const logger = new Logger('ResourceForm');
// columns size
const CS = 6;
const getMaxSizeMB = () => GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_MAXIMUM_FILE_SIZE_MB);

/**
 * Resource Form
 *
 * @author Nadejda Mandrescu
 */
export default class ResourceForm extends Component {
  static contextTypes = {
    activity: PropTypes.object,
  };

  static propTypes = {
    resourceReducer: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    type: PropTypes.number.isRequired,
    onAdd: PropTypes.func,
    onCancel: PropTypes.func,
    updatePendingWebResource: PropTypes.func.isRequired,
    updatePendingDocResource: PropTypes.func.isRequired,
    prepareNewResourceForSave: PropTypes.func.isRequired,
    uploadFileToPendingResourceAsync: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired
  };

  static childContextTypes = {
    activity: PropTypes.object,
    validationResult: PropTypes.array,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(EntityValidator),
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.isDoc = props.type === RC.TYPE_DOC_RESOURCE;
    this.updateFunc = this.isDoc ? props.updatePendingDocResource : props.updatePendingWebResource;
    this.state = {
      uploadingSize: null,
    };
  }

  getChildContext() {
    const { resource, resourceReducer } = this.props;
    return {
      activity: this.context.activity,
      validationResult: resource.errors,
      activityFieldsManager: resourceReducer.resourceFieldsManager,
      activityValidator: resource && resource[ValueConstants.TMP_ENTITY_VALIDATOR],
    };
  }

  componentDidMount() {
    this.updateFunc(this.props.resource);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.uploadingSize && !nextProps.resourceReducer.isFileUploading) {
      this.onUploadComplete();
    }
  }

  onAdd() {
    const { onAdd, prepareNewResourceForSave, resource } = this.props;
    const errors = prepareNewResourceForSave(resource, this.isDoc);
    if (errors.length) {
      const msg = errors.map(e => `[${e.path}]: ${e.errorMessage}`).join(' ');
      logger.error(`Resource validation errors: ${msg}`);
      this.updateFunc(Object.assign({}, resource));
    } else if (onAdd) {
      onAdd(resource);
    }
  }

  onCancel() {
    this.updateFunc(null);
    if (this.props.onCancel) {
      this.props.onCancel(this.props.type);
    }
  }

  onFileUpload() {
    FileDialog.openSingleFileDialog().then(srcPath => {
      if (srcPath) {
        const maxSizeMB = getMaxSizeMB();
        const { size } = FileManager.statSyncFullPath(srcPath);
        if ((maxSizeMB * 1024 * 1024) < size) {
          // eslint-disable-next-line no-alert
          return alert(translate('FileSizeLimitExceeded').replace('{size}', maxSizeMB));
        }
        this.setState({ uploadingSize: size });
        return this.props.uploadFileToPendingResourceAsync(srcPath);
      }
    }).catch(error => {
      notifyError(error);
    });
  }

  onUploadComplete() {
    const { resource } = this.props;
    validate(resource, this.isDoc);
    this.setState({ uploadingSize: null });
    this.updateFunc(resource);
  }

  getLink() {
    return (
      <Col lg={CS} md={CS}>
        <AFField fieldPath={RC.WEB_LINK} parent={this.props.resource} type={Types.INPUT_TYPE} />
      </Col>
    );
  }

  getFileUpload() {
    const { resource } = this.props;
    const { isFileUploading, uploadError } = this.props.resourceReducer;
    const { uploadingSize } = this.state;
    // following AMP message format
    const uploadingMessage = isFileUploading && `${translate('FileUploading')} ${uploadingSize} ${translate('Bytes')}`;
    const fileNameOrMsg = resource[RC.FILE_NAME] || translate('No file chosen');
    const content = !uploadError && resource[RC.FILE_NAME] && resource[RC.CONTENT_ID];
    const size = resource[RC.FILE_SIZE] * 1024 * 1024;
    const uploadConfirm = content
      && `${translate('File')} '${fileNameOrMsg}' ${translate('FileUploaded')} '${size}' ${translate('Bytes')}`;
    const uploadFailed = uploadError && translate('FileUploadFailed');
    const uploadStatusMsg = uploadingMessage || uploadFailed || uploadConfirm;
    return (
      <Col lg={2 * CS} md={2 * CS}>
        <AFField
          fieldPath={RC.FILE_NAME} customLabel={'File'} parent={resource} type={Types.CUSTOM}
          showValidationError={!isFileUploading}>
          <Button onClick={this.onFileUpload.bind(this)} disabled={isFileUploading}>
            {translate('Choose file')}
          </Button>
          <span hidden={isFileUploading} className={resStyles.fileName}>{fileNameOrMsg}</span>
          {uploadStatusMsg && <div>{uploadStatusMsg}</div>}
        </AFField>
      </Col>
    );
  }

  render() {
    const { resource } = this.props;
    const { isFileUploading } = this.props.resourceReducer;
    return (
      <FormGroup>
        <Grid componentClass={resStyles.resourceContainer}>
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
                <Button key="add" bsStyle="success" onClick={this.onAdd.bind(this)} disabled={isFileUploading}>
                  {translate('Add')}
                </Button>
                <Button key="cancel" bsStyle="success" onClick={this.onCancel.bind(this)} disabled={isFileUploading}>
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
