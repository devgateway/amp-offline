import Logger from '../modules/util/LoggerManager';
import {
  RESOURCE_MANAGERS_FULFILLED,
  RESOURCE_MANAGERS_PENDING,
  RESOURCE_MANAGERS_REJECTED,
  RESOURCES_LOAD_FULFILLED,
  RESOURCES_LOAD_PENDING,
  RESOURCES_LOAD_REJECTED,
  RESOURCES_SAVE_FULFILLED,
  RESOURCES_SAVE_PENDING,
  RESOURCES_SAVE_REJECTED,
  RESOURCES_UNLOADED,
} from '../actions/ResourceAction';
import { STATE_CHANGE_LANGUAGE } from '../actions/TranslationAction';
import FieldsManager from '../modules/field/FieldsManager';

const logger = new Logger('ResourceReducer');

const defaultState = {
  isResourcesLoading: false,
  isResourcesLoaded: false,
  isResourceSaving: false,
  isResourcesSaved: false,
  saveError: null,
  isResourceManagersLoading: false,
  isResourceManagersLoaded: false,
  resourcesError: null,
  managersError: null,
  resourcesByUuids: {},
  resourceFieldsManager: null,
};

const resourceReducer = (state = defaultState, action: Object) => {
  logger.debug('resourceReducer');
  switch (action.type) {
    case RESOURCES_UNLOADED:
      return { ...defaultState };
    case RESOURCES_LOAD_PENDING:
      return { ...state, isResourcesLoading: true, isResourcesLoaded: false, resourcesError: null };
    case RESOURCES_LOAD_FULFILLED:
      return {
        ...state,
        isResourcesLoading: false,
        isResourcesLoaded: true,
        resourcesByUuids: { ...state.resourcesByUuids, ...action.payload }
      };
    case RESOURCES_LOAD_REJECTED:
      return { ...state, isResourcesLoading: false, isResourcesLoaded: false, resourcesError: action.payload };
    case RESOURCE_MANAGERS_PENDING:
      return {
        ...state,
        isResourceManagersLoading: true,
        isResourceManagersLoaded: false,
        managersError: null,
        resourceFieldsManager: null,
      };
    case RESOURCE_MANAGERS_FULFILLED:
      return {
        ...state,
        isResourceManagersLoading: false,
        isResourceManagersLoaded: true,
        ...action.payload,
      };
    case RESOURCE_MANAGERS_REJECTED:
      return {
        ...state,
        isResourceManagersLoading: false,
        isResourceManagersLoaded: false,
        managersError: action.payload,
      };
    case RESOURCES_SAVE_PENDING:
      return { ...state, isResourcesSaving: true, isResourcesSaved: false, saveError: null };
    case RESOURCES_SAVE_FULFILLED:
      return { ...state, isResourcesSaving: false, isResourcesSaved: true };
    case RESOURCES_SAVE_REJECTED:
      return { ...state, isResourcesSaving: false, isResourcesSaved: false, saveError: action.payload };
    case STATE_CHANGE_LANGUAGE: {
      let resourceFieldsManager = state.resourceFieldsManager;
      if (resourceFieldsManager) {
        // we no longer will use the previous resourceFieldsManager, thus shallow clone is acceptable
        resourceFieldsManager = FieldsManager.clone(resourceFieldsManager);
        resourceFieldsManager.currentLanguageCode = action.actionData;
      }
      return { ...state };
    }
    default:
      return state;
  }
};

export default resourceReducer;
