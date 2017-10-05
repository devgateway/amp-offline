import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';

/**
 * Simple progress component
 * @author Nadejda Mandrescu
 */
export default class InProgress extends Component {
  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.number
  };

  static defaultProps = {
    value: 100
  };

  render() {
    const { title, value } = this.props;
    return (<div>
      {title && <span>{title}</span>}
      <ProgressBar active now={value} />
    </div>);
  }
}
