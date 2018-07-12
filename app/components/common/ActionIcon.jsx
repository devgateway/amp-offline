import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ActionUrl from './ActionUrl';

/**
 * Action Icon
 *
 * @author Nadejda Mandrescu
 */
export default class ActionIcon extends Component {
  static propTypes = {
    iconClassName: PropTypes.string.isRequired,
    href: PropTypes.string, // external URL
    navUrl: PropTypes.string, // navigation link
    onClick: PropTypes.func, // a custom onClick action
    tooltip: PropTypes.string,
  };

  getIcon() {
    return <span className={this.props.iconClassName} />;
  }

  render() {
    const { href, onClick, navUrl, tooltip } = this.props;
    return <ActionUrl urlContent={this.getIcon()} onClick={onClick} href={href} navUrl={navUrl} tooltip={tooltip} />;
  }
}
