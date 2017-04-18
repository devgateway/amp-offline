import React, { Component, PropTypes } from 'react';
import APField from '../components/APField';
import APPercentageField from '../components/APPercentageField';
import { HIERARCHICAL_VALUE } from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Preview Locations section
 * @author Nadejda Mandrescu
 */
const APPercentageList = (listField, valueField, percentageField, listTitle = null) => class extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    let content = null;
    const items = this.props.activity[listField];
    if (items && items.length) {
      content = items.map(item => {
        const hierarchicalValue = item[valueField][HIERARCHICAL_VALUE];
        const fieldValue = <APPercentageField title={hierarchicalValue} value={item[percentageField]} />;
        return <APField key={hierarchicalValue} value={fieldValue} inline />;
      });
    }
    return <APField key={listTitle} title={translate(listTitle)} value={content}/>;
  }

};

export default APPercentageList;
