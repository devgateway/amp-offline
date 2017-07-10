import React, { Component, PropTypes } from 'react';
import CKEditor from '../../../ckeditor/CKEditor';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Form Rich Text Area component
 * @author Nadejda Mandrescu
 */
export default class AFRichTextEditor extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    language: PropTypes.string.isRequired,
    showValueAsLabel: PropTypes.bool
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      value: ''
    };
  }

  componentWillMount() {
    this._initValue(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    this._initValue(nextProps.value);
  }

  _initValue(value) {
    this.setState({ value });
  }

  handleChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
    this.setState({ value });
  }

  render() {
    if (this.props.showValueAsLabel) {
      return <div>{this.state.value}</div>;
    } else {
      return (
        <div>
          <CKEditor
            id={this.props.id} value={this.state.value} onChange={this.handleChange.bind(this)}
            language={this.props.language} />
        </div>);
    }
  }
}
