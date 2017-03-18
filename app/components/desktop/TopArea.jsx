import React, { Component, PropTypes } from 'react';
import style from './TopArea.css';

export default class TopArea extends Component {

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return (
      <div className={style.container}>
        [{this.props.workspace.id}-{this.props.workspace.name}] -
        This area can be used to show the currency,<br/> applied filters,<br/> filter button, etcetc.<br/>
      </div>
    );
  }
}
