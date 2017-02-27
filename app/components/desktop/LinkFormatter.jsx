// @flow
import React, { Component, PropTypes } from 'react';
import { ACTIVITY_PREVIEW_URL } from '../../utils/Constants';
import translate from '../../utils/translate';

export default class LinkFormatter extends Component {

  static propTypes = {
    row: PropTypes.object.isRequired
  };

  render() {
    // TODO: This link could be dispatch to some action too if needed.
    const link = ACTIVITY_PREVIEW_URL + '/' + this.props.row.ampId;
    return (
      <a href={link} title={translate('Click to preview this activity.')}>{this.props.row.title}</a>
    );
  }
}
