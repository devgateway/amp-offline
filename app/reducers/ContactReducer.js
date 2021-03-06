import { FieldsManager } from 'amp-ui';
import Logger from '../modules/util/LoggerManager';
import {
  CONTACTS_LOAD_PENDING,
  CONTACTS_LOAD_FULFILLED,
  CONTACTS_LOAD_REJECTED,
  CONTACT_LOAD_PENDING,
  CONTACT_LOAD_FULFILLED,
  CONTACT_LOAD_REJECTED,
  CONTACTS_UNLOADED,
  CONTACT_MANAGERS_PENDING,
  CONTACT_MANAGERS_FULFILLED,
  CONTACT_MANAGERS_REJECTED, CONTACTS_SAVE_PENDING, CONTACTS_SAVE_FULFILLED, CONTACTS_SAVE_REJECTED,
} from '../actions/ContactAction';
import { STATE_CHANGE_LANGUAGE } from '../actions/TranslationAction';

const logger = new Logger('ContactReducer');

const defaultState = {
  isContactsLoading: false,
  isContactsLoaded: false,
  isContactLoading: false,
  isContactLoaded: false,
  isContactsSaving: false,
  isContactsSaved: false,
  contactError: null,
  saveError: null,
  isContactManagersLoading: false,
  isContactManagersLoaded: false,
  contactsError: null,
  managersError: null,
  contactsByIds: {},
  contactFieldsManager: null,
};

const contactReducer = (state = defaultState, action: Object) => {
  logger.debug('contactReducer');
  switch (action.type) {
    case CONTACTS_UNLOADED:
      return { ...defaultState };
    case CONTACTS_LOAD_PENDING:
      return { ...state, isContactsLoading: true, isContactsLoaded: false, contactsError: null };
    case CONTACTS_LOAD_FULFILLED:
      return {
        ...state,
        isContactsLoading: false,
        isContactsLoaded: true,
        contactsByIds: { ...state.contactsByIds, ...action.payload }
      };
    case CONTACTS_LOAD_REJECTED:
      return { ...state, isContactsLoading: false, isContactsLoaded: false, contactsError: action.payload };
    case CONTACT_LOAD_PENDING: {
      const cId = action.actionData.id;
      const fullContact = {
        ...state[cId],
        id: cId,
        isContactLoading: true,
        isContactLoaded: false,
        contactError: null
      };
      return {
        ...state,
        contactsByIds: {
          ...state.contactsByIds,
          [cId]: fullContact
        }
      };
    }
    case CONTACT_LOAD_FULFILLED: {
      const cId = action.actionData.id;
      const fullContact = {
        ...state[cId],
        ...action.actionData,
        isContactLoading: false,
        isContactLoaded: true
      };
      return {
        ...state,
        contactsByIds: {
          ...state.contactsByIds,
          [cId]: fullContact
        }
      };
    }
    case CONTACT_LOAD_REJECTED: {
      const cId = action.actionData.id;
      const fullContact = {
        ...state[cId],
        contactError: action.actionData,
        isContactLoading: false,
        isContactLoaded: false
      };
      return {
        ...state,
        contactsByIds: {
          ...state.contactsByIds,
          [cId]: fullContact
        }
      };
    }
    case CONTACT_MANAGERS_PENDING:
      return {
        ...state,
        isContactManagersLoading: true,
        isContactManagersLoaded: false,
        managersError: null,
        contactFieldsManager: null,
      };
    case CONTACT_MANAGERS_FULFILLED:
      return {
        ...state,
        isContactManagersLoading: false,
        isContactManagersLoaded: true,
        ...action.payload,
      };
    case CONTACT_MANAGERS_REJECTED:
      return {
        ...state,
        isContactManagersLoading: false,
        isContactManagersLoaded: false,
        managersError: action.payload,
      };
    case CONTACTS_SAVE_PENDING:
      return { ...state, isContactsSaving: true, isContactsSaved: false, saveError: null };
    case CONTACTS_SAVE_FULFILLED:
      return { ...state, isContactsSaving: false, isContactsSaved: true };
    case CONTACTS_SAVE_REJECTED:
      return { ...state, isContactsSaving: false, isContactsSaved: false, saveError: action.payload };
    case STATE_CHANGE_LANGUAGE: {
      let contactFieldsManager = state.contactFieldsManager;
      if (contactFieldsManager) {
        // we no longer will use the previous contactFieldsManager, thus shallow clone is acceptable
        contactFieldsManager = FieldsManager.clone(contactFieldsManager, Logger);
        contactFieldsManager.currentLanguageCode = action.actionData;
      }
      return { ...state };
    }
    default:
      return state;
  }
};

export default contactReducer;
