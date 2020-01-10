import React, { Component, PropTypes } from 'react';
import { Constants } from 'amp-ui';
import translate from '../../utils/translate';

export default class LinkFormatter extends Component {

  static propTypes = {
    row: PropTypes.object.isRequired
  };

  render() {
    // TODO: This link could be dispatch to some action too if needed.
    const link = `${Constants.ACTIVITY_PREVIEW_URL}/${this.props.row.ampId}`;
    return (
      <a href={link} title={translate('clickToPreviewActivity')}>{this.props.row.title}</a>
    );
  }
}
