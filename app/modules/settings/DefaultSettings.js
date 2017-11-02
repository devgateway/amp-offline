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
  }
];

export default DEFAULT_SETTINGS;
