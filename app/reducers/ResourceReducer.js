import { FieldsManager } from 'amp-ui';
import Logger from '../modules/util/LoggerManager';
import {
  PENDING_RESOURCE_DOC_UPDATED,
  PENDING_RESOURCE_WEB_UPDATED,
  RESOURCE_CREATED,
  RESOURCE_FILE_UPLOAD_FULFILLED,
  RESOURCE_FILE_UPLOAD_PENDING,
  RESOURCE_FILE_UPLOAD_REJECTED,
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
import { UUID } from '../utils/constants/ResourceConstants';

const logger = new Logger('ResourceReducer');

const defaultState = {
  isResourcesLoading: false,
  isResourcesLoaded: false,
  isResourceSaving: false,
  isResourcesSaved: false,
  isFileUploading: false,
  isFileUploaded: false,
  saveError: null,
  uploadError: null,
  isResourceManagersLoading: false,
  isResourceManagersLoaded: false,
  resourcesError: null,
  managersError: null,
  resourcesByUuids: {},
  resourceFieldsManager: null,
  pendingWebResource: null,
  pendingDocResource: null,
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
    case RESOURCE_CREATED: {
      const resource = action.actionData;
      return {
        ...state,
        resourcesByUuids: {
          ...state.resourcesByUuids,
          [resource[UUID]]: resource
        }
      };
    }
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
        resourceFieldsManager = FieldsManager.clone(resourceFieldsManager, Logger);
        resourceFieldsManager.currentLanguageCode = action.actionData;
      }
      return { ...state };
    }
    case PENDING_RESOURCE_WEB_UPDATED:
      return { ...state, pendingWebResource: action.actionData };
    case PENDING_RESOURCE_DOC_UPDATED:
      return { ...state, pendingDocResource: action.actionData };
    case RESOURCE_FILE_UPLOAD_PENDING:
      return { ...state, isFileUploading: true, isFileUploaded: false, uploadError: null };
    case RESOURCE_FILE_UPLOAD_FULFILLED:
      return { ...state, isFileUploading: false, isFileUploaded: true };
    case RESOURCE_FILE_UPLOAD_REJECTED:
      return { ...state, isFileUploading: false, uploadError: action.payload };
    default:
      return state;
  }
};

export default resourceReducer;
