/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../ActivityPreview.css';
import translate from '../../../../utils/translate';
import * as RC from '../../../../utils/constants/ResourceConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import Section from './Section';
import { getActivityResourceUuids } from '../../../../actions/ResourceAction';
import APField from '../components/APField';
import Loading from '../../../common/Loading';
import ActionIcon from '../../../common/ActionIcon';
import docSyles from './APDocument.css';
import ActionUrl from '../../../common/ActionUrl';
import RepositoryManager from '../../../../modules/repository/RepositoryManager';

/**
 * Activity Preview Documents section
 *
 * @author Nadejda Mandrescu
 */
class APDocument extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    resourceReducer: PropTypes.shape({
      isResourcesLoading: PropTypes.bool,
      isResourcesLoaded: PropTypes.bool,
      isResourceManagersLoading: PropTypes.bool,
      isResourceManagersLoaded: PropTypes.bool,
      resourceFieldsManager: PropTypes.instanceOf(FieldsManager),
      resourcesByUuids: PropTypes.object,
    }).isRequired,
    buildSimpleField: PropTypes.func.isRequired,
    saveFileDialog: PropTypes.func.isRequired,
  };

  getResources() {
    const { isResourcesLoaded, isResourceManagersLoaded, resourcesByUuids } = this.props.resourceReducer;
    if (isResourcesLoaded && isResourceManagersLoaded) {
      const resourcesUuids = getActivityResourceUuids(this.props.activity, false);
      return resourcesUuids.map(uuid => {
        const r = { ...resourcesByUuids[uuid] };
        r[RC.ADDING_DATE] = r[RC.ADDING_DATE] || r[RC.CLIENT_ADDING_DATE];
        r[RC.YEAR_OF_PUBLICATION] = r[RC.YEAR_OF_PUBLICATION] || r[RC.CLIENT_YEAR_OF_PUBLICATION];
        return r;
      }).filter(r => r);
    }
    return [];
  }

  /**
   *
   * @param resource
   * @return {{urlText, url, action}}
   */
  getResourceUrlData(resource) {
    const resData = {};
    const fileName = resource[RC.FILE_NAME];
    if (fileName) {
      const srcFile = RepositoryManager.getFullContentFilePath(resource[RC.CONTENT_ID]);
      resData.urlText = fileName;
      resData.action = srcFile ? () => this.props.saveFileDialog(srcFile, fileName) : null;
    }
    const url = resource[RC.WEB_LINK];
    if (url) {
      resData.urlText = url;
      resData.url = url;
    }
    resData.urlText = resData.urlText || translate('No Data');
    return resData;
  }

  renderResource(resource) {
    const { resourceReducer, buildSimpleField } = this.props;
    const { resourceFieldsManager } = resourceReducer;
    const resData = this.getResourceUrlData(resource);
    const isAccessible = resData.url || resData.action;
    const iconClass = (resData.url && docSyles.urlIcon) || (resData.action && docSyles.downloadIcon);
    const tooltip = translate('ClickToDownload');
    return (
      <div key={resource.id} className={[styles.box_table, styles.table_raw].join(' ')}>
        <div key="doc-title" className={docSyles.header}>
          <span key="header" className={styles.section_subtitle_class}>
            <span>{resource[RC.TITLE]}</span>
            <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
            <ActionUrl urlContent={resData.urlText} href={resData.url} onClick={resData.action} tooltip={tooltip} />
          </span>
          {isAccessible &&
          <span key="download" className={docSyles.downloadIconContainer}>
            <ActionIcon
              iconClassName={iconClass} href={resData.url} onClick={resData.action} tooltip={tooltip} />
          </span>
          }
        </div>
        <div key="content">
          {[
            buildSimpleField(RC.DESCRIPTION, true, null, false, resource, resourceFieldsManager),
            buildSimpleField(RC.ADDING_DATE, true, null, false, resource, resourceFieldsManager),
          ]}
        </div>
      </div>
    );
  }

  renderNoResources() {
    const { isResourcesLoading, isResourceManagersLoading } = this.props.resourceReducer;
    if (isResourcesLoading || isResourceManagersLoading) {
      return <Loading />;
    }
    return (
      <APField
        fieldNameClass={styles.hidden} fieldValueClass={styles.nodata} fieldClass={styles.flex} separator={false}
        value={translate('No Data')} />
    );
  }

  render() {
    const resources = this.getResources();
    if (!resources.length) {
      return this.renderNoResources();
    }
    return <div className={docSyles.docList}>{resources.map(this.renderResource.bind(this))}</div>;
  }
}

export default Section(APDocument, 'Related Documents', true, 'APDocument');
