import React, { Component, PropTypes } from 'react';
import CKEditor from '../../../ckeditor/CKEditor';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF Rich text editor');

/**
 * Activity Form Rich Text Area component
 * @author Nadejda Mandrescu
 */
export default class AFRichTextEditor extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    language: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
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
    return (
      <div>
        <CKEditor
          id={this.props.id} value={this.state.value} onChange={this.handleChange.bind(this)}
          language={this.props.language} />
      </div>);
  }
}
