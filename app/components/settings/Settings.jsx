import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import Logger from '../../modules/util/LoggerManager';
import * as CSC from '../../utils/constants/ClientSettingsConstants';
import URLSettings from './URLSettings';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import translate from '../../utils/translate';
import styles from './Settings.css';

const logger = new Logger('Settings Page');

/**
 * Settings Page
 *
 * @author Nadejda Mandrescu
 */
export default class Settings extends Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    allowNavigationTo: PropTypes.string,
    confirmToLeave: PropTypes.func.isRequired,
    triggerPathChange: PropTypes.func.isRequired,
    settingsPageLoaded: PropTypes.func.isRequired,
    isSettingsLoading: PropTypes.bool.isRequired,
    isSettingsLoaded: PropTypes.bool.isRequired,
    settings: PropTypes.array,
    newUrls: PropTypes.array,
    newUrlsProcessed: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    loadSettings: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
    isSettingsSaving: PropTypes.bool.isRequired,
    isUrlTestInProgress: PropTypes.bool.isRequired,
    urlTestResult: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      settings: undefined,
      hasNewUrls: false,
      urlAvailable: new Map()
    };
  }

  componentWillMount() {
    const { router, route } = this.props;
    this.props.loadSettings();
    this.unregisterLeaveHook = router.setRouteLeaveHook(route, this.onRouterWillLeave.bind(this));
  }

  componentDidMount() {
    this.props.settingsPageLoaded();
  }

  componentWillReceiveProps(nextProps) {
    const { isSettingsLoaded, settings, urlTestResult, newUrls, allowNavigationTo, triggerPathChange } = nextProps;
    const { urlAvailable } = this.state;
    let { hasNewUrls } = this.state;
    if (allowNavigationTo) {
      this.props.newUrlsProcessed();
      triggerPathChange(allowNavigationTo);
    }
    if (isSettingsLoaded && settings && !this.state.settings) {
      const urlSetting = settings.find(s => s.id === CSC.SETUP_CONFIG);
      if (newUrls) {
        urlSetting.value.urls = newUrls;
        hasNewUrls = true;
      }
      this.initialUrls = new Set(urlSetting.value.urls);
      urlSetting.value.urls.forEach(url => { urlAvailable.set(url, false); });
      this.setState({ settings, hasNewUrls });
    }
    if (urlTestResult && urlTestResult.url) {
      urlAvailable.set(urlTestResult.url, !!urlTestResult.goodUrl);
      this.setState({ urlAvailable });
    }
  }

  componentWillUnmount() {
    this.unregisterLeaveHook();
  }

  onRouterWillLeave(nextLocation) {
    const nextPath = nextLocation.pathname;
    logger.log(`nextPath=${nextPath}`);
    if (this.didSettingsChance()) {
      if (this.props.allowNavigationTo === nextPath) {
        return true;
      }
      this.props.confirmToLeave(nextPath);
      return false;
    }
    return true;
  }

  onSettingChange(settingId, newSetting) {
    const { settings, urlAvailable } = this.state;
    const setting = settings.find(s => s.id === settingId);
    const value = newSetting && newSetting.value;
    setting.value = newSetting.value;
    if (settingId === CSC.SETUP_CONFIG) {
      const urls = (value && value.urls) || [];
      urls.forEach(url => urlAvailable.set(url, urlAvailable.get(url) || false));
      const urlsSet = new Set(urls);
      // eslint-disable-next-line no-restricted-syntax
      for (const key of urlAvailable.keys()) {
        if (!urlsSet.has(key)) {
          urlAvailable.delete(key);
        }
      }
    }
    this.setState({ settings, urlAvailable });
  }

  didSettingsChance() {
    const { hasNewUrls, settings } = this.state;
    const urls = settings.find(s => s.id === CSC.SETUP_CONFIG).value.urls;
    return hasNewUrls || this.initialUrls.size !== urls.length || urls.some(url => !this.initialUrls.has(url));
  }

  isAtLeastOneValidUrl() {
    return new Set(this.state.urlAvailable.values()).has(true);
  }

  saveSettings() {
    const { hasNewUrls, settings } = this.state;
    this.props.saveSettings(settings, hasNewUrls);
    if (hasNewUrls) {
      this.setState({ hasNewUrls: false });
    }
  }

  renderSettings() {
    const { settings } = this.state;
    const { isUrlTestInProgress, isSettingsSaving } = this.props;
    const isAtLeastOneValidUrl = this.isAtLeastOneValidUrl();
    const canSave = isAtLeastOneValidUrl && !isUrlTestInProgress && !isSettingsSaving;
    const error = isAtLeastOneValidUrl || isUrlTestInProgress ? null : translate('validUrlRequired');
    // TODO since there is no actual design or list of settings, it is simple for now and limited to URL setting
    const urlSetting = settings && settings.find(s => s.id === CSC.SETUP_CONFIG);
    return (<div>
      <FormGroup controlId="settings" validationState={canSave ? null : 'error'}>
        <div className={styles.row}>
          <URLSettings onChange={this.onSettingChange.bind(this, CSC.SETUP_CONFIG)} setting={urlSetting} />
        </div>
        <div className={styles.row}>
          <Button
            bsStyle="success" disabled={!canSave} onClick={this.saveSettings.bind(this)}>
            {translate('Save')}
          </Button>
          <FormControl.Feedback />
          <HelpBlock>{error}</HelpBlock>
        </div>
      </FormGroup>
    </div>);
  }

  render() {
    const { isSettingsLoading, isSettingsLoaded, errorMessage } = this.props;
    if (isSettingsLoading || (isSettingsLoaded && !this.state.settings)) {
      return <Loading />;
    }
    if (!isSettingsLoading && !isSettingsLoaded) {
      if (errorMessage) {
        return <ErrorMessage message={errorMessage} />;
      }
      return null;
    }
    return this.renderSettings();
  }
}
