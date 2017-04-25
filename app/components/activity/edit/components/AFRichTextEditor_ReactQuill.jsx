/**
 * The MIT License (MIT)
 * Copyright (c) 2016, zenoamaro zenoamaro@gmail.com
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*
import React, { Component, PropTypes } from 'react';
import ReactQuill from 'react-quill';
import LoggerManager from '../../../../modules/util/LoggerManager';
 */

/**
 * Some existing options:
 *  draft.js: powerful framework to build a Rich Text Editor (supported by Facebook)
 *    pros: long term support
 *    cons: requires building & maintaining your own editor, which is not for iteration 1
 *  react-rte: the editor was not working properly (e.g. cursor & typing issues, no focus), old/many opened issue
 *  react-draft-wysiwyg: problems to load htmlToDraft from 'html-to-draftjs' for conversions, potentially incompatible
 *    libraries
 *
 * =>
 * ReactQuill integration worked. Quill is also marked as trusted by LinkedIn, Slack, etc.
 * It was quicker than integration with non react based. In the end however I integrated CKEditor for features
 * compatibility with AMP.
 *
 * AFRichTextEditor can be easily switched to ReactQuill or any other editor if it will be needed.
 */

/**
 * Activity Form Rich Text Area component
 * @author Nadejda Mandrescu
 */
/*
export default class AFRichTextEditor extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
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

  // Replicating the same configuration as in AMP.
  modules = {
    toolbar: [
      ['bold', 'italic'],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  formats = [
    'header', 'size',
    'bold', 'italic',
    'list', 'bullet',
    'link'
  ];

  render() {
    return (
      <div>
        <link rel="stylesheet" href="../node_modules/react-quill/dist/quill.snow.css" />
        <ReactQuill
          theme={'snow'} value={this.state.value} onChange={this.handleChange.bind(this)} modules={this.modules}
          formats={this.formats}
        />
      </div>);
  }
}
*/
