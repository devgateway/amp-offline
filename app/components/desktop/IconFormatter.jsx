import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import {
  ACTIVITY_PREVIEW_URL,
  ACTIVITY_EDIT_URL,
  ACTIVITY_STATUS_UNVALIDATED,
} from '../../utils/Constants';
import { WS_ACCESS_TYPE_MANAGEMENT } from '../../utils/constants/WorkspaceConstants';
import translate from '../../utils/translate';
import styles from './IconFormatter.css';

export default class IconFormatter extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    edit: PropTypes.bool.isRequired,
    status: PropTypes.string.isRequired,
    view: PropTypes.bool.isRequired,
    teamLeadFlag: PropTypes.bool.isRequired,
    crossTeamWS: PropTypes.bool.isRequired,
    wsAccessType: PropTypes.string.isRequired,
    teamId: PropTypes.number.isRequired,
    activityTeamId: PropTypes.number.isRequired
  };

  render() {
    // TODO: These links could be dispatch to some action too if needed.
    const editUrl = `${ACTIVITY_EDIT_URL}/${this.props.id}`;
    const viewUrl = `${ACTIVITY_PREVIEW_URL}/${this.props.id}`;
    const editLink = (<Link to={editUrl} title={translate('clickToEditActivity')}>
      <img className={styles.edit_icon} alt="edit" />
    </Link>);
    const validateLink = (<Link to={editUrl} title={translate('clickToValidateActivity')}>
      <img className={styles.validate_icon} alt="validate" />
    </Link>);
    const viewLink = (<Link to={viewUrl} title={translate('clickToPreviewActivity')}>
      <img className={styles.view_icon} alt="view" />
    </Link>);
    let showEditValidate;
    let showView;
    if (this.props.edit) {
      if (this.props.status === ACTIVITY_STATUS_UNVALIDATED) {
        if (this.props.crossTeamWS && this.props.teamLeadFlag) {
          if (this.props.wsAccessType !== WS_ACCESS_TYPE_MANAGEMENT) {
            showEditValidate = validateLink;
          } else {
            showEditValidate = editLink;
          }
        } else if (!this.props.crossTeamWS
          && this.props.teamId === this.props.activityTeamId
          && this.props.teamLeadFlag) {
          showEditValidate = validateLink;
        } else {
          showEditValidate = editLink;
        }
      } else {
        showEditValidate = editLink;
      }
    }
    if (this.props.view) {
      showView = viewLink;
    }
    return (showEditValidate || showView ? (<div>{showEditValidate}{showView}</div>) : <span />);
  }
}
