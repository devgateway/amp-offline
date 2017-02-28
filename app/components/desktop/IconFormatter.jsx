// @flow
import React, { Component, PropTypes } from 'react';
import { ACTIVITY_PREVIEW_URL, ACTIVITY_EDIT_URL } from '../../utils/Constants';
import translate from '../../utils/translate';

export default class IconFormatter extends Component {

  static propTypes = {
    row: PropTypes.object.isRequired
  };

  render() {
    // TODO: These links could be dispatch to some action too if needed.
    const editLink = ACTIVITY_EDIT_URL + '/' + this.props.row.ampId;
    const viewLink = ACTIVITY_PREVIEW_URL + '/' + this.props.row.ampId;
    const iconWidth = 20;
    if (this.props.row.edit) {
      return (<a href={editLink} title={translate('desktop.clickToEditActivity')}>
        <img alt="edit" src="../resources/images/edit.svg" width={iconWidth}/>
      </a>);
    }
    if (this.props.row.view) {
      return (<a href={viewLink} title={translate('desktop.clickToPreviewActivity')}>
        <img alt="view" src="../resources/images/view.svg" width={iconWidth}/>
      </a>);
    }
    return <span/>;
  }
}
