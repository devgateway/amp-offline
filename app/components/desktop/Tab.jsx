import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';

export default class Tab extends Component {

  static propTypes = {
    tabData: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return (
      <li onClick={this.props.handleClick} className={this.props.isActive ? 'active' : null}>
        <a>{translate(this.props.tabData.name)}</a>
      </li>
    );
  }
}
