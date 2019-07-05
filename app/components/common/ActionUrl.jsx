import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { SHELL } from '../../modules/util/ElectronApp';
import * as styles from './CommonStyles.css';

/**
 * Action Url
 *
 * @author Nadejda Mandrescu
 */
export default class ActionUrl extends Component {
  static propTypes = {
    urlContent: PropTypes.any.isRequired,
    href: PropTypes.string, // external URL
    navUrl: PropTypes.string, // navigation link
    onClick: PropTypes.func, // a custom onClick action
    tooltip: PropTypes.string,
  };

  renderExternalLink() {
    const { href, urlContent } = this.props;
    return <a className={styles.url} onClick={() => SHELL.openExternal(href)}>{urlContent}</a>;
  }

  renderCustomAction() {
    const { onClick, urlContent } = this.props;
    return <span className={styles.action} onClick={onClick}>{urlContent}</span>;
  }

  renderNavigationLink() {
    const { navUrl, urlContent } = this.props;
    return <Link to={navUrl}>{urlContent}</Link>;
  }

  renderNoAction() {
    const { urlContent } = this.props;
    return <span className={styles.noAction}>{urlContent}</span>;
  }

  render() {
    const { href, onClick, navUrl, tooltip } = this.props;
    let content;
    if (href) {
      content = this.renderExternalLink();
    } else if (onClick) {
      content = this.renderCustomAction();
    } else if (navUrl) {
      content = this.renderNavigationLink();
    }
    if (content) {
      if (tooltip) {
        const tooltipElement = <Tooltip id="tooltipId" >{tooltip}</Tooltip>;
        content = (
          <OverlayTrigger placement="right" overlay={tooltipElement}>
            {content}
          </OverlayTrigger>
        );
      }
    } else {
      content = this.renderNoAction();
    }
    return content;
  }
}
