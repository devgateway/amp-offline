import React, { Component, PropTypes } from 'react';
import ProjectList from './ProjectList';
import LoggerManager from '../../modules/util/LoggerManager';

export default class TabsContainer extends Component {

  static propTypes = {
    data: PropTypes.array.isRequired,
    activeTab: PropTypes.number.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    const content = this.props.data.find(item => item.id === this.props.activeTab);
    // This is to avoid an error in the winston when we switch WS while being in the desktop page.
    if (content) {
      return (
        <ProjectList projects={content.projects} {...this.props} />
      );
    }
    return null;
  }
}
