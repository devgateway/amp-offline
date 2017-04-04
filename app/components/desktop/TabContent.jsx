import React, { Component, PropTypes } from 'react';
import ProjectList from './ProjectList';

export default class TabsContainer extends Component {

  static propTypes = {
    data: PropTypes.array.isRequired,
    activeTab: PropTypes.number.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    const content = this.props.data.find(item => item.id === this.props.activeTab);
    // This is to avoid an error in the console when we switch WS while being in the desktop page.
    if (content) {
      return (
        <ProjectList projects={content.projects}/>
      );
    }
    return null;
  }
}
