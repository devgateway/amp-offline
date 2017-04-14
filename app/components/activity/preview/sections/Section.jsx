import React, { Component, PropTypes } from 'react';
import APField from '../components/APField';
import SectionGroup from './SectionGroup';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import { RICH_TEXT_FIELDS } from '../../../../utils/constants/FieldPathConstants';

/**
 * Generic activity preview section class
 * @author Nadejda Mandrescu
 */
export default class Section extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  constructor(props) {
    super(props);
    this._sectionName = 'No section name';
    this._sectionContent = 'No section content';
  }

  get sectionName() {
    return this._sectionName;
  }

  /**
   * Builds section elements
   */
  buildContent() {
    return this._sectionContent;
  }

  buildSimpleField(path, showIfNotAvailable) {
    if (this.context.activityFieldsManager.isFieldPathEnabled(path)) {
      const title = this.context.activityFieldsManager.getFieldLabelTranslation(path);
      const value = this.context.activityFieldsManager.getValue(this.context.activity, path);
      if (showIfNotAvailable === true || (value !== undefined && value !== null)) {
        const useInnerHTML = RICH_TEXT_FIELDS.has(path);
        return <APField key={path} title={title} value={value} useInnerHTML={useInnerHTML} />;
      }
    }
  }

  render() {
    const content = this.buildContent();
    if (content) {
      return SectionGroup.instance(this.sectionName, content);
    }
  }
}
