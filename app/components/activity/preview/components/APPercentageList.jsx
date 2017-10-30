import React, { Component, PropTypes } from 'react';
import APField from '../components/APField';
import APPercentageField from '../components/APPercentageField';
import Tablify from '../components/Tablify';
import { HIERARCHICAL_VALUE } from '../../../../utils/constants/ActivityConstants';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../utils/translate';
import styles from '../ActivityPreview.css';
import Utils from '../../../../utils/Utils';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP percentage list');

/**
 * Activity Preview Locations section
 * @author Nadejda Mandrescu
 */
const APPercentageList = (listField, valueField, percentageField, listTitle = null) => class extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string,
    percentTitleClass: PropTypes.string,
    percentValueClass: PropTypes.string,
    tablify: PropTypes.bool,
    columns: PropTypes.number
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    const title = listTitle ? translate(listTitle) : null;
    const items = this.props.activity[listField];
    let content = null;
    const isListEnabled = this.props.activityFieldsManager.isFieldPathEnabled(listField) === true;
    if (isListEnabled) {
      content = (<APField
        key={listField} title={title} value={translate('No Data')} separator={false}
        inline={this.props.tablify === true}
        fieldNameClass={this.props.fieldNameClass} fieldValueClass={styles.nodata} />);
      if (items && items.length) {
        content = items.map(item => {
          const value = item[valueField][HIERARCHICAL_VALUE]
            ? item[valueField][HIERARCHICAL_VALUE]
            : item[valueField].value;
          const key = Utils.stringToUniqueId(value);
          return (<APPercentageField
            key={key} title={value} value={item[percentageField]}
            titleClass={this.props.percentTitleClass} valueClass={this.props.percentValueClass} />);
        });
        if (this.props.tablify) {
          content = <Tablify content={content} columns={this.props.columns} />;
        }
        content = (<APField
          key={listField} title={title} value={content} separator={false} inline={this.props.tablify === true}
          fieldNameClass={this.props.fieldNameClass} fieldValueClass={this.props.fieldValueClass} />);
      }
    }
    return content;
  }

};

export default APPercentageList;
