import React, { Component, PropTypes } from 'react';
import * as Types from './AFComponentTypes';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import LoggerManager from '../../../../modules/util/LoggerManager';
/* eslint-disable class-methods-use-this */

/**
 * Activity Form field value.
 * @author Gabriel Inchauspe
 */
export default class AFValueString extends Component {
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fieldPath: PropTypes.string.isRequired,
    parent: PropTypes.object.isRequired,
    // the component can detect the type automatically or it can be explicitly configured
    type: PropTypes.string,
    className: PropTypes.string
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.fieldExists = false;
  }

  componentWillMount() {
    const fieldPathParts = this.props.fieldPath.split('~');
    this.fieldName = fieldPathParts[fieldPathParts.length - 1];
    this.fieldDef = this.context.activityFieldsManager.getFieldDef(this.props.fieldPath);
    this.fieldExists = !!this.fieldDef;
    this.forcedType = !!this.props.type;
    this.setState({
      value: this.props.parent[this.fieldName]
    });
  }

  componentWillReceiveProps() {
    const value = this.props.parent[this.fieldName];
    this.setState({ value });
  }

  getFieldContent() {
    if (this.props.type === Types.TEXT_AREA
      || this.props.type === Types.RICH_TEXT_AREA || (!this.forcedType && this.fieldDef.field_type === 'string')) {
      return this._getText();
    } else if (this.props.type === Types.NUMBER) {
      return this._getNumber();
    } else {
      return this._getText();
    }
  }

  _getText() {
    if (this.state.value) {
      return (<div className={this.props.className}>{this.state.value.value || this.state.value}</div>);
    } else {
      return null;
    }
  }

  _getNumber() {
    // TODO: format numbers.
    if (this.state.value) {
      return (<div className={this.props.className}>{this.state.value.value || this.state.value}</div>);
    } else {
      return null;
    }
  }

  _getDate() {
    // TODO: Implement.
  }

  render() {
    if (this.fieldExists === false) {
      return null;
    }
    return this.getFieldContent();
  }
}
