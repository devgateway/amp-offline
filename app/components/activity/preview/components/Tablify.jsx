import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../modules/util/LoggerManager';

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
    const rows = Math.ceil(content.length / cols);
    const tableContent = [];

    for (let i = 0; i < rows; i++) {
      const rowContent = [];
      for (let j = 0; j < cols; j++) {
        rowContent.push(<td>{content.pop()}</td>);
      }
      tableContent.push(<tr>{rowContent}</tr>);
    }
    return tableContent;
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const cellWidth = `${Math.floor(100 / this.props.columns)}%`;
    console.log(cellWidth);
    const cellStyle = {
      display: 'inline-block',
      'padding-bottom': '5px',
      'border-bottom': '1px solid #ebebeb',
      width: cellWidth,
      'vertical-align': 'top'
    };
    const cellStyle2 = {
      display: 'inline-block',
      'padding-bottom': '5px',
      'border-left': '1px solid #ebebeb',
      'border-bottom': '1px solid #ebebeb',
      height: '41px',
      width: cellWidth
    };
    const rows = Math.ceil(this.props.content.length / this.props.columns);
    const tableContent = [];
    for (let i = 0; i < rows; i++) {
      const rowContent = [];
      rowContent.push(<div style={cellStyle}>{this.props.content.pop()}</div>);
      for (let j = 1; j < this.props.columns; j++) {
        rowContent.push(<div style={cellStyle2}>{this.props.content.pop()}</div>);
      }
      tableContent.push(<div>{rowContent}</div>);
    }
    return (<div>
      {tableContent}
    </div>);
  }
}
