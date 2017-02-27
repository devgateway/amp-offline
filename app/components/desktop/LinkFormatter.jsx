// @flow
import React, { Component } from 'react';
import { ACTIVITY_PREVIEW_URL } from '../../utils/Constants';

export default class LinkFormatter extends Component {

  render() {
    // TODO: This link could be dispatch to some action too if needed.
    const link = ACTIVITY_PREVIEW_URL + '/' + this.props.row.ampId;
    return (
      <a href={link}>{this.props.row.title}</a>
    );
  }
}
