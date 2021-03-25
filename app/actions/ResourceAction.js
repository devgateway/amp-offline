import { ActivityConstants, Constants, ErrorConstants, ValueConstants, FieldPathConstants,
  FieldsManager, WorkspaceConstants } from 'amp-ui';
import RepositoryHelper from '../modules/helpers/RepositoryHelper';
import {
  CREATOR_EMAIL,
  ORPHAN,
  UUID,
  TEAM,
  CONTENT_ID,
  PUBLIC,
  PRIVATE,
  CLIENT_ADDING_DATE,
  CLIENT_YEAR_OF_PUBLICATION,
  FILE_NAME,
  WEB_LINK,
  RESOURCE_TYPE
} from '../utils/constants/ResourceConstants';
import * as Utils from '../utils/Utils';
import ResourceManager from '../modules/resource/ResourceManager';
import LoggerManager from '../modules/util/LoggerManager';
import ResourceHydrator from '../modules/helpers/ResourceHydrator';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import EntityValidator from '../modules/field/EntityValidator';
import ResourceHelper from '../modules/helpers/ResourceHelper';
import { WORKSPACE_ID } from '../utils/constants/WorkspaceConstants';
import DateUtils from '../utils/DateUtils';
import FileManager from '../modules/util/FileManager';
import FileDialog from '../modules/util/FileDialog';
import Notification from '../modules/helpers/NotificationHelper';
import { addMessage } from './NotificationAction';
import RepositoryManager from '../modules/repository/RepositoryManager';
import translate from '../utils/translate';
import * as URLUtils from '../utils/URLUtils';
import { VALIDATE_ON_CHANGE_ONLY } from '../utils/constants/EntityConstants';
import ValidationError from '../modules/field/ValidationError';
import store from '../index';

export const RESOURCES_LOAD = 'RESOURCES_LOAD';
export const RESOURCES_LOAD_PENDING = 'RESOURCES_LOAD_PENDING';
export const RESOURCES_LOAD_FULFILLED = 'RESOURCES_LOAD_FULFILLED';
export const RESOURCES_LOAD_REJECTED = 'RESOURCES_LOAD_REJECTED';
export const RESOURCE_CREATED = 'RESOURCE_CREATED';
export const RESOURCES_SAVE = 'RESOURCES_SAVE';
export const RESOURCES_SAVE_PENDING = 'RESOURCES_SAVE_PENDING';
export const RESOURCES_SAVE_FULFILLED = 'RESOURCES_SAVE_FULFILLED';
export const RESOURCES_SAVE_REJECTED = 'RESOURCES_SAVE_REJECTED';
export const RESOURCE_MANAGERS = 'RESOURCE_MANAGERS';
export const RESOURCE_MANAGERS_PENDING = 'RESOURCE_MANAGERS_PENDING';
export const RESOURCE_MANAGERS_FULFILLED = 'RESOURCE_MANAGERS_FULFILLED';
export const RESOURCE_MANAGERS_REJECTED = 'RESOURCE_MANAGERS_REJECTED';
export const RESOURCES_UNLOADED = 'RESOURCES_UNLOADED';
export const PENDING_RESOURCE_WEB_UPDATED = 'PENDING_RESOURCE_WEB_UPDATED';
export const PENDING_RESOURCE_DOC_UPDATED = 'PENDING_RESOURCE_DOC_UPDATED';
export const RESOURCE_FILE_UPLOAD = 'RESOURCE_FILE_UPLOAD';
export const RESOURCE_FILE_UPLOAD_PENDING = 'RESOURCE_FILE_UPLOAD_PENDING';
export const RESOURCE_FILE_UPLOAD_FULFILLED = 'RESOURCE_FILE_UPLOAD_FULFILLED';
export const RESOURCE_FILE_UPLOAD_REJECTED = 'RESOURCE_FILE_UPLOAD_REJECTED';


const logger = new LoggerManager('ResourceAction');

/* eslint-disable import/prefer-default-export */
/**
 * Try to delete orphan content
 * @return {*|Promise<T>}
 */
export const deleteOrphanResources = () => {
  logger.log('deleteOrphanResources');
  const filter = Utils.toMap(ORPHAN, true);
  return RepositoryHelper.findAllContents(filter)
    .then(contents => Promise.all(contents.map(ResourceManager.deleteContent)))
    .then(ResourceManager.cleanupUnreferencedContent);
};

export const loadHydratedResourcesForActivity = (activity) => (dispatch, ownProps) => {
  const unhydratedIds = getActivityResourceUuids(activity);
  return configureResourceManagers()(dispatch, ownProps)
    .then(() => loadHydratedResources(unhydratedIds)(dispatch, ownProps));
};

export const loadHydratedResources = (uuids) => (dispatch, ownProps) => dispatch({
  type: RESOURCES_LOAD,
  payload: _hydrateResources(uuids, ownProps().workspaceReducer.currentWorkspace.id,
    ownProps().resourceReducer.resourceFieldsManager, ownProps().activityReducer.activity)
});

export const loadNewResource = (resource) => (dispatch) => dispatch({
  type: RESOURCE_CREATED,
  actionData: resource
});

export const unloadResources = () => (dispatch) => dispatch({ type: RESOURCES_UNLOADED });

export const dehydrateAndSaveActivityResources = (activity) => (dispatch, ownProps) => dispatch({
  type: RESOURCES_SAVE,
  payload: _dehydrateAndSaveResources(
    _getHydratedActivityResources(activity, ownProps().resourceReducer.resourcesByUuids),
    ownProps().userReducer.teamMember[WORKSPACE_ID], ownProps().userReducer.userData.email,
    ownProps().resourceReducer.resourceFieldsManager.fieldsDef)
});

export const addNewActivityResource = (activity, resource, isDoc) => (dispatch, ownProps) => {
  logger.info('addNewActivityResource');
  if (!activity[ActivityConstants.ACTIVITY_DOCUMENTS]) {
    activity[ActivityConstants.ACTIVITY_DOCUMENTS] = [];
  }
  activity[ActivityConstants.ACTIVITY_DOCUMENTS].push({
    [ActivityConstants.DOCUMENT_TYPE]: ValueConstants.RELATED_DOCUMENTS,
    [UUID]: resource,
  });
  loadNewResource(resource)(dispatch, ownProps);
  clearPendingDoc(isDoc)(dispatch, ownProps);
};

const clearPendingDoc = (isDoc) => (dispatch, ownProps) => {
  if (isDoc) {
    updatePendingDocResource(null)(dispatch, ownProps);
  } else {
    updatePendingWebResource(null)(dispatch, ownProps);
  }
};

/**
 * Tries to add pending resource to the activity and clears up pending resource if wasn't able to
 * @param activity
 * @return {Function}
 */
export const tryToAutoAddPendingResourcesToActivity = (activity) => (dispatch, ownProps) => {
  logger.info('tryToAutoAddPendingResourcesToActivity');
  const { pendingWebResource, pendingDocResource } = ownProps().resourceReducer;
  _tryToAutoAddPendingResourcesToActivity(activity, pendingWebResource, false)(dispatch, ownProps);
  _tryToAutoAddPendingResourcesToActivity(activity, pendingDocResource, true)(dispatch, ownProps);
};

const _tryToAutoAddPendingResourcesToActivity = (activity, resource, isDoc) => (dispatch, ownProps) => {
  if (resource) {
    const errors = prepareNewResourceForSave(resource, isDoc)(dispatch, ownProps);
    if (!errors.length) {
      addNewActivityResource(activity, resource, isDoc)(dispatch, ownProps);
    } else {
      if (isDoc) {
        RepositoryManager.attemptToDeleteContent(resource[CONTENT_ID]);
      }
      clearPendingDoc(isDoc)(dispatch, ownProps);
    }
  }
};

/**
 * Prepares a new resource to be saved
 * @param resource
 * @param isDoc
 * @return {[{ errorMessage, path }]} the list of errors
 */
export const prepareNewResourceForSave = (resource, isDoc) => (dispatch, ownProps) => {
  logger.log('prepareNewResourceForSave');
  const createdAt = new Date();
  resource[CLIENT_ADDING_DATE] = DateUtils.getTimestampForAPI(createdAt);
  resource[CLIENT_YEAR_OF_PUBLICATION] = `${createdAt.getFullYear()}`;
  resource[CREATOR_EMAIL] = ownProps().userReducer.userData.email;
  resource[TEAM] = ownProps().userReducer.teamMember[WORKSPACE_ID];
  resource[PRIVATE] = true;
  resource[PUBLIC] = false;
  resource[ValueConstants.TMP_ENTITY_VALIDATOR].entity = resource;
  if (!isDoc && resource[WEB_LINK]) {
    resource[WEB_LINK] = URLUtils.normalizeUrl(resource[WEB_LINK], 'http');
  }
  return validate(resource, isDoc);
};

export const validate = (resource, isDoc) => {
  logger.debug('validate');
  const errors = resource[ValueConstants.TMP_ENTITY_VALIDATOR].areAllConstraintsMet(resource);
  const docError = isDoc && errors.length && errors.find((ve: ValidationError) => ve.path === FILE_NAME);
  if (docError) {
    docError.errorMessage = translate('FileNotAvailable');
  }
  return errors;
};

export const updatePendingWebResource = (resource) => (dispatch) => dispatch({
  type: PENDING_RESOURCE_WEB_UPDATED,
  actionData: resource
});

export const updatePendingDocResource = (resource) => (dispatch) => dispatch({
  type: PENDING_RESOURCE_DOC_UPDATED,
  actionData: resource
});

export const uploadFileToPendingResourceAsync = (srcFile) => (dispatch, ownProps) => {
  const resource = ownProps().resourceReducer.pendingDocResource;
  return dispatch({
    type: RESOURCE_FILE_UPLOAD,
    payload: ResourceManager.uploadFileToHydratedResource(resource, srcFile)
  });
};

export const configureResourceManagers = () => (dispatch, ownProps) => dispatch({
  type: RESOURCE_MANAGERS,
  payload: _getResourceManagers(ownProps().workspaceReducer.currentWorkspace.id, ownProps().translationReducer.lang,
    ownProps().workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD])
});

const _getResourceManagers = (wsId, currentLanguage, wsPrefix) => Promise.all([
  FieldsHelper.findByWorkspaceMemberIdAndType(wsId, Constants.SYNCUP_TYPE_RESOURCE_FIELDS)
    .then(fields => fields[Constants.SYNCUP_TYPE_RESOURCE_FIELDS]),
  PossibleValuesHelper.findAllByIdsWithoutPrefixAndCleanupPrefix(FieldPathConstants.PREFIX_RESOURCE)
]).then(([rFields, possibleValuesCollection]) => ({
  resourceFieldsManager: new FieldsManager(rFields, possibleValuesCollection, currentLanguage, LoggerManager, wsPrefix)
}));

const _hydrateResources = (uuids, wsId, resourceFieldsManager, activity) => Promise.all([
  ResourceManager.findResourcesByUuidsWithContent(uuids),
  FieldsHelper.findByWorkspaceMemberIdAndType(wsId, Constants.SYNCUP_TYPE_RESOURCE_FIELDS)
    .then(fields => fields[Constants.SYNCUP_TYPE_RESOURCE_FIELDS])
]).then(([resources, rFields]) => {
  if (resources && resources.length) {
    const rh = new ResourceHydrator(rFields);
    return rh.hydrateEntities(resources);
  }
  return [];
}).then((resources) => _flagAsFullyHydrated(resources, resourceFieldsManager, activity)).then(_mapByField);

const _flagAsFullyHydrated = (resources, resourceFieldsManager, activity) => {
  if (resources && resources.length) {
    const rMap = Utils.toMapByKey(resources, UUID);
    const ars = activity[ActivityConstants.ACTIVITY_DOCUMENTS];
    ars.forEach(ar => {
      const r = rMap.get(ar[UUID]);
      if (r) {
        r[ValueConstants.TMP_ENTITY_VALIDATOR] = new EntityValidator(r, resourceFieldsManager, null, null,
          store.getState().workspaceReducer.currentWorkspace);
        r[VALIDATE_ON_CHANGE_ONLY] = true;
        ar[UUID] = r;
        ar[ValueConstants.TMP_ENTITY_VALIDATOR] = r[ValueConstants.TMP_ENTITY_VALIDATOR];
      }
    });
  }
  return resources;
};

const _mapByField = (elements, fieldName = UUID) => {
  const elementsByField = {};
  elements.forEach(el => (elementsByField[el[fieldName]] = el));
  return elementsByField;
};

const _getHydratedActivityResources = (activity, resourcesByUuid) =>
  getActivityResourceUuids(activity).map(uuid => resourcesByUuid[uuid]);

const _dehydrateAndSaveResources = (resources, teamId, email, fieldsDef) => {
  const rh = new ResourceHydrator(fieldsDef);
  let contents = resources.map(r => r[CONTENT_ID]).filter(c => c);
  _cleanupTmpFields(resources);
  return rh.dehydrateEntities(resources)
    .then(() => ResourceHelper.findResourcesByUuids(resources.map(r => r[UUID])))
    .then(Utils.toMapByKey)
    .then(rMap => _getOnlyNewResources(resources, rMap, teamId, email))
    .then(ResourceHelper.saveOrUpdateResourceCollection)
    .then(rs => {
      const cIds = new Set(Utils.flattenToListByKey(rs, CONTENT_ID).filter(cId => cId));
      contents = contents.filter(c => cIds.has(c.id));
      return contents.length ? RepositoryHelper.saveOrUpdateContentCollection(contents) : contents;
    });
};

const _cleanupTmpFields = (resources) => {
  resources.forEach(r => {
    delete r[ValueConstants.TMP_ENTITY_VALIDATOR];
    const content = r[CONTENT_ID];
    if (content) {
      r[CONTENT_ID] = r[CONTENT_ID].id;
    }
  });
  return resources;
};

const _getOnlyNewResources = (resources, dbResourcesMapById, teamId, email) => resources.filter(r => {
  const dbR = dbResourcesMapById.get(r[UUID]);
  const toSave = !dbR;
  if (toSave) {
    r[CREATOR_EMAIL] = email;
    r[TEAM] = teamId;
  }
  return toSave;
});

export const getActivityResourceUuids = (activity) => _getActivityResources(activity, true);

const _getActivityResources = (activity, asIds = true) => {
  const resources = new Set();
  const docs = activity[ActivityConstants.ACTIVITY_DOCUMENTS];
  if (docs && docs.length) {
    docs.forEach(d => resources.add((asIds && d[UUID] && d[UUID][UUID]) || d[UUID]));
  }
  return Array.from(resources);
};

export const buildNewResource = (resourceFieldsManager, resourceType) => {
  const resource = {};
  ResourceHelper.stampClientChange(resource);
  resource[ValueConstants.TMP_ENTITY_VALIDATOR] = new EntityValidator(resource, resourceFieldsManager, null, [],
    store.getState().workspaceReducer.currentWorkspace);
  resource[RESOURCE_TYPE] = { id: resourceType, value: resourceType };
  return resource;
};

export const saveFileDialog = (srcFile, fileName) => (dispatch) => {
  if (!srcFile || !FileManager.statSyncFullPath(srcFile)) {
    dispatch(addMessage(toNotif('FileNotAvailable')));
  } else {
    const saveResult = FileDialog.saveDialog(srcFile, fileName);
    if (saveResult === null) {
      dispatch(addMessage(toNotif('unexpectedError')));
    }
  }
};

const toNotif = (message) => new Notification(
  { message, origin: ErrorConstants.NOTIFICATION_ORIGIN_RESOURCE, translateMsg: true });
