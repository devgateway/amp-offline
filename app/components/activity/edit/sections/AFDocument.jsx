/* eslint-disable jsx-a11y/anchor-has-content,class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AFSection from './AFSection';
import { RELATED_DOCUMENTS } from './AFSectionConstants';
import { FIELD_NAME } from '../../../../utils/constants/FieldPathConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import ErrorMessage from '../../../common/ErrorMessage';
import { ACTIVITY_DOCUMENTS } from '../../../../utils/constants/ActivityConstants';
import Loading from '../../../common/Loading';
import {
  ACTION,
  ADDING_DATE,
  FILE_NAME,
  FILE_SIZE,
  RESOURCE_NAME,
  TITLE,
  TYPE,
  UUID,
  WEB_LINK,
  YEAR_OF_PUBLICATION
}
  from '../../../../utils/constants/ResourceConstants';
import * as docStyles from './document/AFDocument.css';
import * as listStyles from '../components/AFList.css';
import * as apDocStyles from '../../preview/sections/APDocument.css';
import translate from '../../../../utils/translate';
import APLabel from '../../preview/components/APLabel';
import DateUtils from '../../../../utils/DateUtils';
import ActionIcon from '../../../common/ActionIcon';

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
    isSaveAndSubmit: PropTypes.bool.isRequired,
  };

  static childContextTypes = {
    resourceReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(ActivityValidator),
    isSaveAndSubmit: PropTypes.bool,
  };

  static propTypes = {
    resourceReducer: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props);
    this.toAPLabel = this.toAPLabel.bind(this);
    this.toDelete = this.toDelete.bind(this);
    this.toAction = this.toAction.bind(this);
    this.state = {
      docs: this.getDocuments(context),
    };
  }

  getChildContext() {
    return {
      activity: this.context.activity,
      activityFieldsManager: this.props.resourceReducer.resourceFieldsManager,
      activityValidator: this.context.activityValidator,
      isSaveAndSubmit: this.context.isSaveAndSubmit,
      resourceReducer: this.props.resourceReducer,
    };
  }

  onDelete(uuid) {
    // TODO
    console.log(uuid);
  }

  getDocuments(context = this.context) {
    const docs = context.activity[ACTIVITY_DOCUMENTS] || [];
    return docs.map(ac => {
      const doc = ac[UUID];
      // TODO actual action
      const action = doc[FILE_NAME] ? null : null;
      doc[RESOURCE_NAME] = doc[WEB_LINK] || doc[FILE_NAME];
      doc[ACTION] = { href: doc[WEB_LINK], action };
      return doc;
    });
  }

  getDocListHeaders() {
    const { resourceFieldsManager } = this.props.resourceReducer;
    const fieldsDef = AF_FIELDS.map(f => resourceFieldsManager.fieldsDef.find(fd => f === fd[FIELD_NAME]));
    const headers = [<TableHeaderColumn key={UUID} dataField={UUID} isKey hidden />].concat(fieldsDef.map(fd => {
      const fieldName = fd[FIELD_NAME];
      const formatExtraData = { fd };
      const customTrn = AF_CUSTOM_TRN[fieldName];
      const label = customTrn ? translate(customTrn) : resourceFieldsManager.getFieldLabelTranslation(fieldName);
      return (
        <TableHeaderColumn
          key={fieldName} dataField={fieldName} dataFormat={this.toAPLabel} formatExtraData={formatExtraData}
          columnClassName={docStyles[`header_${fd[FIELD_NAME]}`]}>
          {label}
        </TableHeaderColumn>
      );
    }));
    const fds = resourceFieldsManager.fieldsDef.filter(fd => [WEB_LINK, FILE_NAME].includes(fd[FIELD_NAME]));
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
    let value = fd ? resourceFieldsManager.getValue(row, fd[FIELD_NAME]) : cell;
    if (fd && fd.field_type === 'date') {
      value = DateUtils.createFormattedDate(value);
    }
    value = value || '';
    return <APLabel label={value} tooltip={value} dontTranslate labelClass={docStyles.cell} />;
  }

  toDelete(cell) {
    return <a onClick={this.onDelete.bind(this, cell)} className={listStyles.delete} href={null} />;
  }

  toAction(cell) {
    if (cell.href || cell.action) {
      // TODO user url and AF specific icons for download, but confirm w VG if simply go w download button for docs
      return <ActionIcon iconClassName={apDocStyles.downloadIcon} href={cell.href} onClick={cell.action} />;
    }
    return null;
  }

  renderDocList() {
    const headers = this.getDocListHeaders();

    return (
      <BootstrapTable data={this.state.docs} hover headerContainerClass={docStyles.headerContainer}>
        {headers}
      </BootstrapTable>
    );
  }

  render() {
    const { resourcesError, contentsError, managersError } = this.props.resourceReducer;
    const errors = [resourcesError, contentsError, managersError].filter(e => e);
    if (errors.length) {
      return <ErrorMessage message={errors.join(' ')} />;
    }
    const { isResourcesLoading, isContentsLoading, isResourceManagersLoading } = this.props.resourceReducer;
    if (isResourcesLoading || isContentsLoading || isResourceManagersLoading) {
      return <Loading />;
    }
    // TODO adding docs

    return (
      <div>
        {this.renderDocList()}
      </div>
    );
  }

}

export default AFSection(AFDocument, RELATED_DOCUMENTS);
