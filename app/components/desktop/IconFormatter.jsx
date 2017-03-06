// @flow
import React, { Component, PropTypes } from 'react';
import { ACTIVITY_PREVIEW_URL, ACTIVITY_EDIT_URL } from '../../utils/Constants';
import translate from '../../utils/translate';
import styles from './IconFormatter.css';

export default class IconFormatter extends Component {

  static propTypes = {
    row: PropTypes.object.isRequired
  };

  render() {
    // TODO: These links could be dispatch to some action too if needed.
    const editLink = ACTIVITY_EDIT_URL + '/' + this.props.row.ampId;
    const viewLink = ACTIVITY_PREVIEW_URL + '/' + this.props.row.ampId;
    if (this.props.row.edit) {
      return (<a href={editLink} title={translate('clickToEditActivity')}>
        <img className={styles.edit_icon} alt="edit"/>
      </a>);
    }
    if (this.props.row.view) {
      return (<a href={viewLink} title={translate('clickToPreviewActivity')}>
        <img className={styles.view_icon} alt="view"/>
      </a>);
    }
    return <span/>;
  }
}
