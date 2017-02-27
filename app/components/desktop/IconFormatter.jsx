// @flow
import React, { Component } from 'react';
import { ACTIVITY_PREVIEW_URL, ACTIVITY_EDIT_URL } from '../../utils/Constants';

export default class IconFormatter extends Component {

  render() {
    // TODO: These links could be dispatch to some action too if needed.
    const editLink = ACTIVITY_EDIT_URL + '/' + this.props.row.ampId;
    const viewLink = ACTIVITY_PREVIEW_URL + '/' + this.props.row.ampId;
    if (this.props.row.edit) {
      return <a href={editLink}><img alt="edit" src="../resources/images/edit.svg" width={20}/></a>;
    }
    if (this.props.row.view) {
      return <a href={viewLink}><img alt="view" src="../resources/images/view.svg" width={20}/></a>;
    }
    return <span></span>;
  }
}
