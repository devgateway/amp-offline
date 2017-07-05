import React, { Component } from 'react';
import LoggerManager from '../../../../modules/util/LoggerManager';


/**
 * Component for converting content to table form
 * @author Anya Marshall
 */
export default class Tablify extends Component {

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
    return (<div />);
  }
}
