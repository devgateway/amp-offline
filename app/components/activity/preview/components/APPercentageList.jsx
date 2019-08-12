import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldsManager, FeatureManager, PossibleValuesManager } from 'amp-ui';
import APField from '../components/APField';
import APPercentageField from '../components/APPercentageField';
import Tablify from '../components/Tablify';
import translate from '../../../../utils/translate';
import styles from '../ActivityPreview.css';
import Utils from '../../../../utils/Utils';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP percentage list');

/**
 * Activity Preview Percentage List type section
 * @author Nadejda Mandrescu
 */
const APPercentageList = (listField, valueField, percentageField, listTitle = null) => class extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string,
    percentTitleClass: PropTypes.string,
    percentValueClass: PropTypes.string,
    tablify: PropTypes.bool,
    columns: PropTypes.number,
    fmPath: PropTypes.string,
    getItemTitle: PropTypes.func,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getItemTitle(item) {
    if (this.props.getItemTitle) {
      return this.props.getItemTitle(item);
    }
    const obj = item[valueField];
    return obj[ActivityConstants.HIERARCHICAL_VALUE] ?
      obj[ActivityConstants.HIERARCHICAL_VALUE] : PossibleValuesManager.getOptionTranslation(obj);
  }

  render() {
    const title = listTitle ? translate(listTitle) : null;
    let items = this.props.activity[listField];
    let content = null;
    let isListEnabled = this.props.activityFieldsManager.isFieldPathEnabled(listField) === true;
    if (this.props.fmPath) {
      isListEnabled = FeatureManager.isFMSettingEnabled(this.props.fmPath) ? isListEnabled : false;
    }
    if (isListEnabled) {
      if (items && items.length) {
        items = items.map(item => ({
          itemTitle: this.getItemTitle(item),
          percentage: item[percentageField]
        })).sort((a, b) => a.itemTitle.localeCompare(b.itemTitle));
        content = items.map(({ itemTitle, percentage }) =>
          <APPercentageField
            key={Utils.stringToUniqueId(itemTitle)} title={itemTitle} value={percentage}
            titleClass={this.props.percentTitleClass} valueClass={this.props.percentValueClass} />
        );
        if (this.props.tablify) {
          content = <Tablify content={content} columns={this.props.columns} />;
        }
        content = (<APField
          key={listField} title={title} value={content} separator={false} inline={this.props.tablify === true}
          fieldNameClass={this.props.fieldNameClass} fieldValueClass={this.props.fieldValueClass} />);
      } else {
        content = (<APField
          key={listField} title={title} value={translate('No Data')} separator={false}
          inline={this.props.tablify === true}
          fieldNameClass={this.props.fieldNameClass} fieldValueClass={styles.nodata} />);
      }
    }
    return content;
  }

};

export default APPercentageList;
