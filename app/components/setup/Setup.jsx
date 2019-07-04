/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import * as styles from './Setup.css';
import { LOGIN_URL, OTHER_ID } from '../../utils/Constants';
import * as URLUtils from '../../utils/URLUtils';
import AFOption from '../activity/edit/components/AFOption';
import AFDropDown from '../activity/edit/components/AFDropDown';
import translate from '../../utils/translate';
import AFLabel from '../activity/edit/components/AFLabel';
import InProgress from '../common/InProgress';
import SetupManager from '../../modules/setup/SetupManager';
import Notification from '../../modules/helpers/NotificationHelper';
import SimpleNotification from '../common/SimpleNotification';
import ErrorMessage from '../common/ErrorMessage';
import AmpServer from '../../modules/setup/AmpServer';

/**
 * First time application setup
 * @author Nadejda Mandrescu
 */
export default class Setup extends Component {
  static propTypes = {
    /* eslint-disable react/no-unused-prop-types */
    isAppInitialized: PropTypes.bool.isRequired,
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
    errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Notification)]),
    setupComplete: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      retryOptionsLoad: false,
      isTestingConnectivity: false,
      countryOptions: [],
      rawOptions: [],
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
    } else if (props.isAppInitialized) {
      if (!(isSetupOptionsLoaded || isSetupOptionsLoading || isSetupOptionsLoadFailed)) {
        loadSetupOptions();
      } else if ((isSetupOptionsLoaded && optionsCount < 2) || (isSetupOptionsLoadFailed && optionsCount < 1)) {
        const { lang, defaultLang, languageList, setupOptions } = props;
        let rawOptions = [SetupManager.getCustomOption(languageList)];
        if (isSetupOptionsLoaded) {
          rawOptions = setupOptions.map(o => new AmpServer(o)).concat(rawOptions);
        }
        const countryOptions = this.toAFOptions(rawOptions, defaultLang, lang);
        this.setState({ countryOptions, rawOptions });
      } else if (props.errorMessage) {
        this.setState({ isTestingConnectivity: false });
      }
    }
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
    this.setState({ customValue, isValid });
  }

  isCustomValueValid(customValue) {
    return URLUtils.isValidUrl(customValue);
  }

  onConfigure() {
    this.setState({ isTestingConnectivity: true });
    const selectedOption = this.getSelectedRawOption();
    const { isCustom, customValue } = this.state;
    if (isCustom) {
      selectedOption.urls = [customValue];
    }
    this.props.setupComplete(selectedOption);
  }

  getSelectedRawOption() {
    const { selectedOptionId } = this.state;
    return selectedOptionId && this.state.rawOptions.find(o => o.id === selectedOptionId);
  }

  getLoadingMessage() {
    if (this.props.isSetupOptionsLoading) {
      return translate('loadingOptions');
    }
    if (this.state.isTestingConnectivity) {
      return translate('testingConnectivity');
    }
  }

  renderCustomOption() {
    return (<div className={styles.row}>
      <FormGroup controlId="customValueText" validationState={this.state.isValid ? null : 'error'}>
        <FormControl
          type="text" placeholder="https://…"
          value={this.state.customValue} onChange={this.onCustomOptionChange.bind(this)} />
        <HelpBlock>{translate('customHint')}</HelpBlock>
        <FormControl.Feedback />
      </FormGroup>
    </div>);
  }

  renderErrorMessage(errorMessage) {
    return errorMessage instanceof Notification ?
      <SimpleNotification notification={errorMessage} /> : <ErrorMessage message={translate(errorMessage)} />;
  }

  render() {
    const { errorMessage, isSetupOptionsLoading, isSetupOptionsLoadFailed, isSetupComplete, loadSetupOptions } =
      this.props;
    const { isCustom, isValid, isTestingConnectivity, selectedOptionId } = this.state;
    const inProgress = isSetupOptionsLoading || isSetupComplete || isTestingConnectivity;
    const hideProgress = !(isSetupOptionsLoading || isTestingConnectivity);
    const displayError = isSetupOptionsLoadFailed && !isCustom ? translate('noConnectionToRegistry') : errorMessage;
    return (<div className={styles.centered}>
      <div>
        <AFLabel value={translate('setupFor')} required className={styles.label} />
        <AFDropDown
          selectedId={selectedOptionId} options={this.state.countryOptions} onChange={this.onOptionChange.bind(this)} />
      </div>
      {isCustom && this.renderCustomOption()}
      <div className={styles.row}>
        <span className={styles.cell}>
          <Button disabled={!isValid || inProgress} bsStyle="success" onClick={() => this.onConfigure()}>
            {translate('Configure')}
          </Button>
        </span>
        <span className={styles.cell}>
          {isSetupOptionsLoadFailed &&
          (<Button disabled={inProgress} bsStyle="success" onClick={() => loadSetupOptions()}>
            {translate('Reload options')}
          </Button>)
          }
        </span>
      </div>
      <div className={styles.row}>
        {displayError && this.renderErrorMessage(displayError)}
      </div>
      <div className={styles.row} hidden={hideProgress}>
        <InProgress title={this.getLoadingMessage()} />
      </div>
    </div>);
  }
}
