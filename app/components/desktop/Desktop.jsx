/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import TopArea from '../desktop/TopArea';
import TabsContainer from './TabsContainer';

export default class Desktop extends Component {

  static propTypes = {
    desktop: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  render() {
    console.log('render');
    return (
      <div>
        <TopArea workspace={this.props.workspace.currentWorkspace}/>
        <TabsContainer tabsData={this.props.desktop.tabsData} paginationOptions={this.props.desktop.paginationOptions}/>
      </div>
    );
  }
}
