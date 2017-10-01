import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import * as styles from './Setup.css';
import { LOGIN_URL } from '../../utils/Constants';
import * as URLUtils from '../../utils/URLUtils';
import ErrorMessage from '../common/ErrorMessage';
import AFOption from '../activity/edit/components/AFOption';
import AFDropDown from '../activity/edit/components/AFDropDown';
import translate from '../../utils/translate';

/* eslint-disable class-methods-use-this */

const OTHER_ID = 999888777;

/**
 * First time application setup
 * @author Nadejda Mandrescu
 */
export default class Setup extends Component {
  static propTypes = {
    /* eslint-disable react/no-unused-prop-types */
    loadSetupOptions: PropTypes.func.isRequired,
    isSetupComplete: PropTypes.bool.isRequired,
    isSetupOptionsLoading: PropTypes.bool.isRequired,
    isSetupOptionsLoaded: PropTypes.bool.isRequired,
    isSetupOptionsLoadFailed: PropTypes.bool.isRequired,
    setupOptions: PropTypes.array,
    lang: PropTypes.string.isRequired,
    defaultLang: PropTypes.string.isRequired,
    languageList: PropTypes.array.isRequired,
    /* eslint-enable react/no-unused-prop-types */
    errorMessage: PropTypes.string,
    setupComplete: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      countryOptions: [],
      selectedOptionId: undefined,
      customValue: null,
      isCustom: false,
      isValid: false
    };
  }

  componentWillMount() {
    this.onNewProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.onNewProps(nextProps);
  }

  onNewProps(props) {
    if (props.isSetupComplete) {
      URLUtils.forwardTo(LOGIN_URL);
    } else if (!(props.isSetupOptionsLoaded || props.isSetupOptionsLoading || props.isSetupOptionsLoadFailed)) {
      props.loadSetupOptions();
    } else if (props.setupOptions) {
      const { lang, defaultLang, languageList, setupOptions } = props;
      const otherOption = { id: OTHER_ID, name: languageList.map(code => translate('Other', code)), urls: [] };
      this.setupOptionsAndOther = setupOptions.concat([otherOption]);
      const countryOptions = this.setupOptionsAndOther.map(option => new AFOption({
        id: option.id,
        value: option.name[defaultLang] || option.name[lang] || option.name[0],
        'translated-value': option.name
      }));
      this.setState({ countryOptions });
    }
  }

  onOptionChange(option) {
    const selectedOptionId = option && option.id > 0 ? option.id : undefined;
    const isCustom = selectedOptionId === OTHER_ID;
    const isValid = (isCustom && this.isCustomValueValid(this.state.customValue)) || (!isCustom && selectedOptionId);
    this.setState({ selectedOptionId, isCustom, isValid });
  }

  onCustomOptionChange(e) {
    const customValue = e.target.value;
    const isValid = this.isCustomValueValid(customValue);
    this.setState({ customValue, isValid });
  }

  getSelectedOption() {
    const { selectedOptionId } = this.state;
    return selectedOptionId && this.setupOptionsAndOther.find(o => o.id === selectedOptionId);
  }

  isCustomValueValid(customValue) {
    return URLUtils.isValidUrl(customValue);
  }

  renderCustomOption() {
    return (<div className={styles.row}>
      <FormGroup controlId="customValueText" validationState={this.state.isValid ? 'success' : 'error'}>
        <FormControl
          type="text" placeholder="https://…"
          value={this.state.customValue} onChange={this.onCustomOptionChange.bind(this)} />
        <HelpBlock>{translate('customHint')}</HelpBlock>
        <FormControl.Feedback />
      </FormGroup>
    </div>);
  }

  render() {
    const { errorMessage } = this.props;
    return (<div className={styles.centered}>
      <div>
        <AFDropDown options={this.state.countryOptions} onChange={this.onOptionChange.bind(this)} />
      </div>
      {this.state.isCustom && this.renderCustomOption()}
      <div className={styles.row}>
        <Button
          disabled={!this.state.isValid} bsStyle="success"
          onClick={() => this.props.setupComplete(this.getSelectedOption())}>
          {translate('Configure')}
        </Button>
      </div>
      <div className={styles.row}>
        {errorMessage && <ErrorMessage message={errorMessage} />}
      </div>
    </div>);
  }
}
