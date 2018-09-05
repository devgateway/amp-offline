import * as CS from '../../utils/constants/ClientSettingsConstants';

/**
 * Default client settings. See ClientSettingsHelper.settingsSchema for properties that can be configured.
 *
 * @author Nadejda Mandrescu
 */

const DEFAULT_SETTINGS = [
  {
    id: CS.LAST_CONNECTIVITY_STATUS,
    name: CS.LAST_CONNECTIVITY_STATUS,
    visible: false,
    type: CS.SETTING_TYPE_OBJECT
  },
  {
    id: CS.SETUP_CONFIG,
    name: CS.SETUP_CONFIG,
    visible: true,
    public: true,
    type: CS.SETTING_TYPE_OBJECT
  },
  {
    id: CS.DEFAULT_SETUP_COMPLETE,
    name: CS.DEFAULT_SETUP_COMPLETE,
    visible: false,
    type: CS.SETTING_TYPE_BOOLEAN,
    value: false
  },
  {
    id: CS.AMP_SERVER_ID,
    name: CS.AMP_SERVER_ID,
    visible: false,
    type: CS.SETTING_TYPE_STRING,
  },
  {
    id: CS.AMP_SETTINGS_FROM_AMP_REGISTRY,
    name: CS.AMP_SETTINGS_FROM_AMP_REGISTRY,
    visible: false,
    type: CS.SETTING_TYPE_OBJECT,
  },
  {
    id: CS.LAST_AMP_SETTINGS_STATUS,
    name: CS.LAST_AMP_SETTINGS_STATUS,
    visible: false,
    type: CS.SETTING_TYPE_STRING,
  },
];

export default DEFAULT_SETTINGS;
