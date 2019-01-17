import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../ActivityPreview.css';
import Logger from '../../../../modules/util/LoggerManager';
import * as Utils from '../../../../utils/Utils';

const logger = new Logger('tablify');

/**
 * Component for converting content to table form
 * @author Anya Marshall
 */
export default class Tablify extends Component {

  static propTypes = {
    content: PropTypes.any,
    columns: PropTypes.number
  };

  /**
   * Takes an array and turns it into table rows and columns.
   * @author Anya Marshall
   * @param content content for table
   * @param cols number of columns
   */
  static addRows(content, cols) {
    // Remove undefined cells.
    content = content.filter(c => c);
    // Decrease number of cols if we dont have enough elements.
    if (content.length < cols) {
      cols = content.length;
    }
    const rows = Math.ceil(content.length / cols);
    const tableContent = [];

    for (let i = 0; i < rows; i++) {
      const rowContent = [];
      for (let j = 0; j < cols; j++) {
        rowContent.push(<td key={Utils.stringToUniqueId()}>{content.pop()}</td>);
      }
      tableContent.push(<tr key={Utils.stringToUniqueId()}>{rowContent}</tr>);
    }
    return tableContent;
  }

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    const columns = this.props.columns >= this.props.content.length ? this.props.content.length : this.props.columns;
    const cellWidth = `${(100 / columns)}%`;
    const cellwidthStyle = {
      width: cellWidth
    };
    const rows = Math.ceil(this.props.content.length / columns);
    const tableContent = [];
    for (let i = 0; i < rows; i++) {
      const rowContent = [];
      rowContent.push(<div key={Utils.stringToUniqueId()} style={cellwidthStyle} className={styles.tablify_outer_cell}>
        {this.props.content.pop()}</div>);
      for (let j = 1; j < this.props.columns && this.props.content.length > 0; j++) {
        const key = Utils.stringToUniqueId();
        rowContent.push(<div key={key} style={cellwidthStyle} className={styles.tablify_inner_cell}>
          {this.props.content.pop()}</div>);
      }
      tableContent.push(<div key={Utils.stringToUniqueId()} className={styles.flex}>{rowContent}</div>);
    }
    return (<div>
      {tableContent}
    </div>);
  }
}
