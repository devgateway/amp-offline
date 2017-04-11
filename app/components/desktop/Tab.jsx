import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';

export default class Tab extends Component {

  static propTypes = {
    tabData: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    return (
      <li onClick={this.props.handleClick} className={this.props.isActive ? 'active' : null}>
        <a>{translate(this.props.tabData.name)}</a>
      </li>
    );
  }
}
