import React, { Component, PropTypes } from 'react';
import ProjectList from './ProjectList';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Tab content');

export default class TabsContainer extends Component {

  static propTypes = {
    data: PropTypes.array.isRequired,
    activeTab: PropTypes.number.isRequired
  };

  constructor() {
    super();
    logger.log('constructor');
  }

  render() {
    logger.log('render');
    const content = this.props.data.find(item => item.id === this.props.activeTab);
    // This is to avoid an error in the winston when we switch WS while being in the desktop page.
    if (content) {
      return (
        <ProjectList projects={content.projects} name={content.name} {...this.props} />
      );
    }
    return null;
  }
}
