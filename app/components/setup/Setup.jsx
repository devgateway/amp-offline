import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import * as styles from './Setup.css';
import { LOGIN_URL, OTHER_ID } from '../../utils/Constants';
import * as URLUtils from '../../utils/URLUtils';
import ErrorMessage from '../common/ErrorMessage';
import AFOption from '../activity/edit/components/AFOption';
import AFDropDown from '../activity/edit/components/AFDropDown';
import translate from '../../utils/translate';
import AFLabel from '../activity/edit/components/AFLabel';

/* eslint-disable class-methods-use-this, react/sort-comp */

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
      retryOptionsLoad: false,
      countryOptions: [],
      selectedOptionId: undefined,
      customValue: '',
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
    const { isSetupOptionsLoaded, isSetupOptionsLoading, isSetupOptionsLoadFailed, loadSetupOptions } = props;
    const optionsCount = this.state.countryOptions.length;
    if (props.isSetupComplete) {
      URLUtils.forwardTo(LOGIN_URL);
    } else if (!(isSetupOptionsLoaded || isSetupOptionsLoading || isSetupOptionsLoadFailed)) {
      loadSetupOptions();
    } else if ((isSetupOptionsLoaded && optionsCount < 2) || (isSetupOptionsLoadFailed && optionsCount < 1)) {
      const { lang, defaultLang, languageList, setupOptions } = props;
      let options = [this.getCustomOption(languageList)];
      if (isSetupOptionsLoaded) {
        options = setupOptions.concat(options);
      }
      const countryOptions = this.toAFOptions(options, defaultLang, lang);
      this.setState({ countryOptions });
    }
  }

  getCustomOption(languageList) {
    return {
      id: OTHER_ID,
      name: languageList.reduce((resultMap, code) => {
        resultMap[code] = translate('Other', code);
        return resultMap;
      }, {}),
      urls: []
    };
  }

  toAFOptions(registryOptions, defaultLang, lang) {
    return registryOptions.map(option => new AFOption({
      id: option.id,
      value: option.name[defaultLang] || option.name[lang] || option.name[0],
      'translated-value': option.name
    }));
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
    const countryOptions = [...this.state.countryOptions];
    const customOption = countryOptions.find(o => o.id === OTHER_ID);
    customOption.urls = [customValue.trim()];
    this.setState({ customValue, isValid, countryOptions });
  }

  getSelectedOption() {
    const { selectedOptionId } = this.state;
    return selectedOptionId && this.state.countryOptions.find(o => o.id === selectedOptionId);
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

  renderRetryButton() {
    return (<Button bsStyle="success" onClick={() => this.props.loadSetupOptions()}>
      {translate('Reload options')}
    </Button>);
  }

  render() {
    const { errorMessage, isSetupOptionsLoadFailed, setupComplete } = this.props;
    const { isCustom } = this.state;
    const displayError = isSetupOptionsLoadFailed && !isCustom ? translate('noConnectionToRegistry') : errorMessage;
    return (<div className={styles.centered}>
      <div>
        <AFLabel value={translate('setupFor')} required className={styles.label} />
        <AFDropDown options={this.state.countryOptions} onChange={this.onOptionChange.bind(this)} />
      </div>
      {isCustom && this.renderCustomOption()}
      <div className={styles.row}>
        <span className={styles.cell}>
          <Button
            disabled={!this.state.isValid} bsStyle="success"
            onClick={() => setupComplete(this.getSelectedOption())}>
            {translate('Configure')}
          </Button>
        </span>
        <span className={styles.cell}>
          {isSetupOptionsLoadFailed && this.renderRetryButton()}
        </span>
      </div>
      <div className={styles.row}>
        {displayError && <ErrorMessage message={displayError} />}
      </div>
    </div>);
  }
}
