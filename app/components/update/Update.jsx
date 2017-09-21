import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

/**
 * Update screen to download the installer and proceed with the update
 *
 * @author Nadejda Mandrescu
 */
export default class Update extends Component {
  static propTypes = {
    dismissUpdate: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillUnmount() {
    this.props.dismissUpdate();
  }

  render() {
    return (<div>
      TODO
    </div>);
  }
}
