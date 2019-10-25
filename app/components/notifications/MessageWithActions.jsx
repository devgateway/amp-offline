import React, { Component } from 'react';
import { ActionUrl } from 'amp-ui';
import PropTypes from 'prop-types';
import ActionDef from '../../modules/util/ActionDef';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';

const logger = new Logger('MessageWithActions');

/**
 * @author Nadejda Mandrescu
 */
export default class MessageWithActions extends Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(ActionDef)
  };

  render() {
    const { message } = this.props;
    const actions = (this.props.actions || []).slice();
    if (actions.length) {
      const messageParts = message.split('%');
      const content = [];
      while (actions.length && messageParts.length > 1) {
        const action: ActionDef = actions.shift();
        content.push(<span key={Utils.stringToUniqueId()}>{messageParts.shift()}</span>);
        content.push(
          <ActionUrl
            key={Utils.stringToUniqueId()}
            urlContent={messageParts.shift()}
            href={action.href}
            navUrl={action.navUrl}
            onClick={action.onClick} />);
      }
      if (actions.length || messageParts.length > 1) {
        logger.error(`Malformed message with actions. The result can be unexpected. Original message: ${message}`);
      }
      messageParts.forEach(m => content.push(<span key={Utils.stringToUniqueId()}>{m}</span>));
      return <span>{content}</span>;
    }
    return <span>{message}</span>;
  }
}
