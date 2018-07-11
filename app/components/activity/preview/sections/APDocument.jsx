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
import FileDialog from '../../../../modules/util/FileDialog';

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
      isContentsLoading: PropTypes.bool,
      isContentsLoaded: PropTypes.bool,
      isResourceManagersLoading: PropTypes.bool,
      isResourceManagersLoaded: PropTypes.bool,
      resourceFieldsManager: PropTypes.instanceOf(FieldsManager),
      resourcesByUuids: PropTypes.object,
      contentsByIds: PropTypes.object,
    }).isRequired,
    buildSimpleField: PropTypes.func.isRequired,
  };

  getResources() {
    const { isResourcesLoaded, isResourceManagersLoaded, isContentsLoaded, resourcesByUuids } =
      this.props.resourceReducer;
    if (isResourcesLoaded && isResourceManagersLoaded && isContentsLoaded) {
      const resourcesUuids = getActivityResourceUuids(this.props.activity, false);
      return resourcesUuids.map(uuid => resourcesByUuids[uuid]).filter(r => r);
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
      const { contentsByIds } = this.props.resourceReducer;
      const content = contentsByIds[resource[RC.CONTENT_ID]];
      const srcFile = content && content[RC.PATH];
      resData.urlText = fileName;
      resData.action = srcFile ? () => FileDialog.saveDialog(srcFile, fileName) : null;
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
    return (
      <div key={resource.id} className={[styles.box_table, styles.table_raw].join(' ')}>
        <div key="doc-title" className={docSyles.header}>
          <span key="header" className={styles.section_subtitle_class}>
            <span>{resource[RC.TITLE]}</span>
            <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
            <ActionUrl urlContent={resData.urlText} href={resData.url} onClick={resData.action} />
          </span>
          <span key="download" className={docSyles.downloadIconContainer}>
            <ActionIcon iconClassName={docSyles.downloadIcon} href={resData.url} onClick={resData.action} />
          </span>
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
    const { isResourcesLoading, isResourceManagersLoading, isContentsLoading } = this.props.resourceReducer;
    if (isResourcesLoading || isResourceManagersLoading || isContentsLoading) {
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
