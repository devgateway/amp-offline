import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { ACTIVITY_PREVIEW_URL, ACTIVITY_EDIT_URL } from '../../utils/Constants';
import translate from '../../utils/translate';
import styles from './IconFormatter.css';

export default class IconFormatter extends Component {

  static propTypes = {
    row: PropTypes.object.isRequired
  };

  render() {
    // TODO: These links could be dispatch to some action too if needed.
    const editLink = `${ACTIVITY_EDIT_URL}/${this.props.row.id}`;
    const viewLink = `${ACTIVITY_PREVIEW_URL}/${this.props.row.id}`;
    let edit;
    let view;
    if (this.props.row.edit) {
      edit = (<Link to={editLink} title={translate('clickToEditActivity')}>
        <img className={styles.edit_icon} alt="edit"/>
      </Link>);
    }
    if (this.props.row.view) {
      view = (<Link to={viewLink} title={translate('clickToPreviewActivity')}>
        <img className={styles.view_icon} alt="view"/>
      </Link>);
    }
    return (edit || view ? (<div>{ edit }{ view }</div>) : <span/>);
  }
}
