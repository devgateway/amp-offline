/* eslint-disable jsx-a11y/anchor-has-content,class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Panel } from 'react-bootstrap';
import {
  ActionIcon,
  ActivityConstants,
  APLabel,
  FeatureManager,
  FeatureManagerConstants,
  FieldPathConstants,
  FieldsManager,
  Loading,
  PossibleValuesManager,
  WorkspaceConstants
} from 'amp-ui';
import { ResourceFormPage } from '../../../../containers/ResourcePage';
import AFSection from './AFSection';
import { RELATED_DOCUMENTS } from './AFSectionConstants';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import ErrorMessage from '../../../common/ErrorMessage';
import {
  ACTION,
  ADDING_DATE,
  CLIENT_ADDING_DATE,
  CLIENT_YEAR_OF_PUBLICATION,
  CONTENT_ID,
  FILE_NAME,
  FILE_SIZE,
  RESOURCE_NAME,
  TITLE,
  TYPE,
  TYPE_DOC_RESOURCE,
  TYPE_WEB_RESOURCE,
  UUID,
  WEB_LINK,
  YEAR_OF_PUBLICATION
} from '../../../../utils/constants/ResourceConstants';
import * as docStyles from './document/AFDocument.css';
import * as listStyles from '../components/AFList.css';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';
import RepositoryManager from '../../../../modules/repository/RepositoryManager';
import StaticAssetsUtils from '../../../../utils/StaticAssetsUtils';
import FileManager from '../../../../modules/util/FileManager';
import { buildNewResource } from '../../../../actions/ResourceAction';
import Logger from '../../../../modules/util/LoggerManager';
import { SHELL } from '../../../../modules/util/ElectronApp';

const AF_FIELDS = [TITLE, ADDING_DATE, YEAR_OF_PUBLICATION, FILE_SIZE, TYPE];
/* following the preferance confirmed by Vanessa G. to keep contacts API fields translations related to Contact Manager,
the resources API fields translations will be left related to Resource Manager. Hence using AF custom labels trns in AF.
 */
const AF_CUSTOM_TRN = {
  [YEAR_OF_PUBLICATION]: 'Year',
  [ADDING_DATE]: 'Date',
  [FILE_SIZE]: 'Size',
  [TYPE]: 'Document Type',
};

/**
 * AF Related Documents Section
 *
 * @author Nadejda Mandrescu
 */
class AFDocument extends Component {
  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
    activity: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    resourceReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(ActivityValidator),
    Logger: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    workspaceReducer: PropTypes.object
  };

  static propTypes = {
    resourceReducer: PropTypes.object.isRequired,
    addNewActivityResource: PropTypes.func.isRequired,
    saveFileDialog: PropTypes.func.isRequired,
    workspaceReducer: PropTypes.object
  };

  constructor(props, context) {
    super(props);
    this.toAPLabel = this.toAPLabel.bind(this);
    this.toDelete = this.toDelete.bind(this);
    this.toAction = this.toAction.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.allowAddDocuments = FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_DOCUMENTS_ADD_DOCUMENT);
    this.allowAddWebLinks = FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_DOCUMENTS_ADD_WEBLINK);
    this.state = {
      docs: this.getDocuments(context),
      docFormOpened: false,
      linkFormOpened: false,
    };
  }

  getChildContext() {
    return {
      activity: this.context.activity,
      activityFieldsManager: this.props.resourceReducer.resourceFieldsManager,
      activityValidator: this.context.activityValidator,
      resourceReducer: this.props.resourceReducer,
      Logger,
      translate,
    };
  }

  onAdd(resource) {
    const isDoc = !!resource[FILE_NAME];
    this.props.addNewActivityResource(this.context.activity, resource, isDoc);
    const newState = { docs: this.getDocuments() };
    newState[isDoc ? 'docFormOpened' : 'linkFormOpened'] = false;
    this.setState(newState);
  }

  onCancel(resourceType) {
    if (resourceType === TYPE_DOC_RESOURCE) {
      this.setState({ docFormOpened: false });
    } else {
      this.setState({ linkFormOpened: false });
    }
  }

  onDelete(uuid) {
    const aDocs = this.context.activity[ActivityConstants.ACTIVITY_DOCUMENTS];
    this.context.activity[ActivityConstants.ACTIVITY_DOCUMENTS] = aDocs.filter(ad => ad[UUID][UUID] !== uuid);
    this.setState({ docs: this.getDocuments() });
  }

  getDocSizeToDisplay(doc) {
    let size = doc[FILE_SIZE] || 0;
    // AMP doesn't use GS format here (since that may not have digits)
    size = Math.round(size * 1000) / 1000;
    size = size.toFixed((size && (size < 1 ? 3 : 2)) || 1);
    return size;
  }

  getDocuments(context = this.context) {
    const docs = context.activity[ActivityConstants.ACTIVITY_DOCUMENTS] || [];
    return docs.map(ac => {
      const doc = { ...ac[UUID] };
      const srcFile = RepositoryManager.getFullContentFilePath(doc[CONTENT_ID]);
      const fileName = doc[FILE_NAME];
      const action = fileName && srcFile ? () => this.props.saveFileDialog(srcFile, fileName) : null;
      doc[RESOURCE_NAME] = doc[WEB_LINK] || fileName;
      doc[FILE_SIZE] = this.getDocSizeToDisplay(doc);
      doc[ACTION] = { href: doc[WEB_LINK], action, fileName };
      doc[ADDING_DATE] = doc[ADDING_DATE] || doc[CLIENT_ADDING_DATE];
      doc[YEAR_OF_PUBLICATION] = doc[YEAR_OF_PUBLICATION] || doc[CLIENT_YEAR_OF_PUBLICATION];
      return doc;
    });
  }

  getPendingOrNewResource(resourceType) {
    const { pendingWebResource, pendingDocResource, resourceFieldsManager } = this.props.resourceReducer;
    let resource = resourceType === TYPE_DOC_RESOURCE ? pendingDocResource : pendingWebResource;
    if (!resource) {
      resource = buildNewResource(resourceFieldsManager, resourceType);
    }
    return resource;
  }

  getDocListHeaders() {
    const { resourceFieldsManager } = this.props.resourceReducer;
    const allFieldsDef = resourceFieldsManager.fieldsDef;
    const fieldsDef = AF_FIELDS.map(f => allFieldsDef.find(fd => f === fd[FieldPathConstants.FIELD_NAME]))
      .filter(fd => fd);
    const headers = [<TableHeaderColumn key={UUID} dataField={UUID} isKey hidden />].concat(fieldsDef.map(fd => {
      const fieldName = fd[FieldPathConstants.FIELD_NAME];
      const formatExtraData = { fd };
      const customTrn = AF_CUSTOM_TRN[fieldName];
      const label = customTrn ? translate(customTrn) : resourceFieldsManager.getFieldLabelTranslation(fieldName,
        this.props.workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]);
      return (
        <TableHeaderColumn
          key={fieldName} dataField={fieldName} dataFormat={this.toAPLabel} formatExtraData={formatExtraData}
          columnClassName={docStyles[`header_${fd[FieldPathConstants.FIELD_NAME]}`]}>
          {label}
        </TableHeaderColumn>
      );
    }));
    const fds = resourceFieldsManager.fieldsDef.filter(fd => [WEB_LINK, FILE_NAME]
      .includes(fd[FieldPathConstants.FIELD_NAME]));
    const formatExtraData = { fds };
    headers.splice(2, 0, (
      <TableHeaderColumn
        key={RESOURCE_NAME} dataField={RESOURCE_NAME} dataFormat={this.toAPLabel} formatExtraData={formatExtraData}>
        {translate('Resource Name')}
      </TableHeaderColumn>
    ));
    headers.push(
      <TableHeaderColumn
        key="action" dataField={ACTION} dataFormat={this.toAction} columnClassName={docStyles.action} />,
      <TableHeaderColumn key="delete" dataField={UUID} dataFormat={this.toDelete} columnClassName={docStyles.delete} />
    );
    return headers;
  }

  toAPLabel(cell, row, formatExtraData) {
    const { fd } = formatExtraData;
    const { resourceFieldsManager } = this.props.resourceReducer;
    let value = fd ? resourceFieldsManager.getValue(row, fd[FieldPathConstants.FIELD_NAME],
        PossibleValuesManager.getOptionTranslation) :
      cell;
    if (fd && fd.field_type === 'date') {
      value = DateUtils.createFormattedDate(value);
    }
    value = `${value || ''}`;
    return (<APLabel
      label={value} tooltip={value} dontTranslate labelClass={docStyles.cell} />);
  }

  toDelete(cell) {
    return <a onClick={this.onDelete.bind(this, cell)} className={listStyles.delete} href={null} />;
  }

  handleIconError(e) {
    e.target.onerror = null;
    e.target.src = StaticAssetsUtils.getDocIconPath('default.icon.gif');
  }

  toAction(cell) {
    if (cell.href || cell.action) {
      const extension = cell.fileName && FileManager.extname(cell.fileName)
        .substring(1);
      const iconFile = (extension && `${extension}.gif`) || (cell.href && 'ico_attachment.png');
      const srcIcon = StaticAssetsUtils.getStaticImagePath('doc-icons', iconFile);
      const iconElement = <img src={srcIcon} alt="" onError={this.handleIconError} />;
      return (<ActionIcon
        iconElement={iconElement} href={cell.href} onClick={cell.action} openExternal={SHELL.openExternal} />);
    }
    return null;
  }

  renderDocList() {
    const headers = this.getDocListHeaders();
    const options = {
      withoutNoDataText: true,
    };

    return (
      <BootstrapTable
        data={this.state.docs} options={options} hover
        headerContainerClass={docStyles.headerContainer} tableContainerClass={docStyles.listContainer}>
        {headers}
      </BootstrapTable>
    );
  }

  renderResourcePanel(resourceType) {
    const isDoc = resourceType === TYPE_DOC_RESOURCE;
    const header = isDoc ? 'Add New Document' : 'Add New Web Link';
    const headerEl = <div className={docStyles.formHeader}>{translate(header)}</div>;
    return (
      <Panel key={`add-${resourceType}`}>
        <Panel.Heading>
          <Panel.Title toggle>{headerEl}</Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <ResourceFormPage
              type={resourceType} resource={this.getPendingOrNewResource(resourceType)}
              onAdd={this.onAdd} onCancel={this.onCancel} />
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    )
      ;
  }

  render() {
    const { resourcesError, contentsError, managersError } = this.props.resourceReducer;
    const errors = [resourcesError, contentsError, managersError].filter(e => e);
    if (errors.length) {
      return <ErrorMessage message={errors.join(' ')} />;
    }
    const { isResourcesLoading, isContentsLoading, isResourceManagersLoading } = this.props.resourceReducer;
    if (isResourcesLoading || isContentsLoading || isResourceManagersLoading) {
      return <Loading Logger={Logger} translate={translate} />;
    }

    return (
      <div>
        {this.renderDocList()}
        {this.allowAddDocuments && this.renderResourcePanel(TYPE_DOC_RESOURCE)}
        {this.allowAddWebLinks && this.renderResourcePanel(TYPE_WEB_RESOURCE)}
      </div>
    );
  }

}

export default AFSection(AFDocument, RELATED_DOCUMENTS);
