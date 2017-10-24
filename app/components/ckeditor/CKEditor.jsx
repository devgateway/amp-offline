import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import styles from './CKEditor.css';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';
import { LANGUAGE_ENGLISH } from '../../utils/Constants';

/**
 * TODO (iteration 2+) check if we can download full version via npm or the right customization to include unde libs.
 * Clarification:
 * We need full version in order to use FontSize, but it is not configurable via npm. CKEditor is currently
 * integrated as a library under 'libs' folder with the latest full release version.
 * There is also an option to get a customized version, so you can pick up only plugins you use to reduce lib size.
 * However you need to carefully check that all used and depenent plugins are included, otherwise some may not work.
 * In any case during packaging unused code should be ignored.
 */
const CKEDITOR = window.CKEDITOR;

/**
 * CK Editor React wrapper
 * @author Nadejda Mandrescu
 */
export default class CKEditor extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    language: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      value: null,
      show: false
    };
    this.editorName = null;
  }

  componentWillMount() {
    this.placeholder = `ck-editor_${this.props.id}`;
  }

  componentDidMount() {
    this._toogleEditor();
  }

  componentDidUpdate(prevProps) {
    // Only update config if the editor is open and language has changed.
    if (prevProps.language !== this.props.language) {
      if (this.state.show) {
        this._hide();
        this._show();
      }
    }
    this._toogleEditor();
  }

  _toogleEditor() {
    if (this.toggle) {
      if (this.state.show) {
        this._show();
      } else {
        this._hide();
      }
    }
  }

  _show() {
    if (!CKEDITOR) {
      LoggerManager.error('CKEditor not found');
      return;
    }

    const configuration = {
      toolbar: [
        ['Bold', 'Italic'],
        ['NumberedList', 'BulletedList'],
        ['Link', 'Unlink', 'PasteFromWord', 'RemoveFormat'],
        ['FontSize']
      ],
      extraPlugins: 'richcombo',
      language: this.props.language || LANGUAGE_ENGLISH
    };
    this.editorName = CKEDITOR.replace(this.placeholder, configuration).name;
    this.toggle = false;
    const editor = CKEDITOR.instances[this.editorName];
    editor.on('blur', () => {
      if (this.props.onChange) {
        const data = editor.getData();
        this.props.onChange(data);
      }
    });
  }

  _hide() {
    this.toggle = false;
    const editor = CKEDITOR.instances[this.editorName];
    // this is a workaround for https://dev.ckeditor.com/ticket/16825 issue that is planned to be fixed in 4.7.0
    editor.focusManager.blur(true);
    editor.destroy(true);
  }

  toggleEditor() {
    this.setState({ show: !this.state.show });
    this.toggle = true;
  }

  render() {
    return (
      <div>
        <div name={this.placeholder} >
          <Panel onClick={this.toggleEditor.bind(this)} className={styles.viewMode} >
            <div dangerouslySetInnerHTML={{ __html: this.props.value }} />
          </Panel>
        </div>
        <div hidden={!this.state.show} >
          <Button bsStyle="link" onClick={this.toggleEditor.bind(this)} >{translate('close editor')}</Button>
        </div>
      </div>
    );
  }

}
