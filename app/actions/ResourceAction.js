import RepositoryHelper from '../modules/helpers/RepositoryHelper';
import { CREATOR_EMAIL, ORPHAN, UUID, TEAM } from '../utils/constants/ResourceConstants';
import * as AC from '../utils/constants/ActivityConstants';
import * as Utils from '../utils/Utils';
import ResourceManager from '../modules/resource/ResourceManager';
import Logger from '../modules/util/LoggerManager';
import ResourceHydrator from '../modules/helpers/ResourceHydrator';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import { SYNCUP_TYPE_RESOURCE_FIELDS } from '../utils/Constants';
import { PREFIX_RESOURCE } from '../utils/constants/FieldPathConstants';
import FieldsManager from '../modules/field/FieldsManager';
import PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import EntityValidator from '../modules/field/EntityValidator';
import ResourceHelper from '../modules/helpers/ResourceHelper';
import { RELATED_DOCUMENTS, TMP_ENTITY_VALIDATOR } from '../utils/constants/ValueConstants';

export const RESOURCES_LOAD = 'RESOURCES_LOAD';
export const RESOURCES_LOAD_PENDING = 'RESOURCES_LOAD_PENDING';
export const RESOURCES_LOAD_FULFILLED = 'RESOURCES_LOAD_FULFILLED';
export const RESOURCES_LOAD_REJECTED = 'RESOURCES_LOAD_REJECTED';
export const RESOURCES_SAVE = 'RESOURCES_SAVE';
export const RESOURCES_SAVE_PENDING = 'RESOURCES_SAVE_PENDING';
export const RESOURCES_SAVE_FULFILLED = 'RESOURCES_SAVE_FULFILLED';
export const RESOURCES_SAVE_REJECTED = 'RESOURCES_SAVE_REJECTED';
export const RESOURCE_MANAGERS = 'RESOURCE_MANAGERS';
export const RESOURCE_MANAGERS_PENDING = 'RESOURCE_MANAGERS_PENDING';
export const RESOURCE_MANAGERS_FULFILLED = 'RESOURCE_MANAGERS_FULFILLED';
export const RESOURCE_MANAGERS_REJECTED = 'RESOURCE_MANAGERS_REJECTED';
export const RESOURCES_UNLOADED = 'RESOURCES_UNLOADED';


const logger = new Logger('ResourceAction');

/* eslint-disable import/prefer-default-export */
/**
 * Try to delete orphan content
 * @return {*|Promise<T>}
 */
export const deleteOrphanResources = () => {
  logger.log('deleteOrphanResources');
  const filter = Utils.toMap(ORPHAN, { $eq: true });
  return RepositoryHelper.findAllContents(filter)
    .then(contents => Promise.all(contents.map(ResourceManager.deleteContent)));
};

export const loadHydratedResourcesForActivity = (activity) => (dispatch, ownProps) => {
  const unhydratedIds = getActivityResourceUuids(activity);
  return configureResourceManagers()(dispatch, ownProps)
    .then(() => loadHydratedResources(unhydratedIds)(dispatch, ownProps));
};

export const loadHydratedResources = (uuids) => (dispatch, ownProps) => dispatch({
  type: RESOURCES_LOAD,
  payload: _hydrateResources(uuids, ownProps().userReducer.teamMember.id,
    ownProps().resourceReducer.resourceFieldsManager, ownProps().activityReducer.activity)
});

export const unloadResources = () => (dispatch) => dispatch({ type: RESOURCES_UNLOADED });

export const dehydrateAndSaveActivityResources = (activity) => (dispatch, ownProps) => dispatch({
  type: RESOURCES_SAVE,
  payload: _dehydrateAndSaveResources(
    _getHydratedActivityResources(activity, ownProps().resourceReducer.resourcesByUuids),
    ownProps().userReducer.teamMember,
    ownProps().resourceReducer.resourceFieldsManager.fieldsDef)
});

export const configureResourceManagers = () => (dispatch, ownProps) => dispatch({
  type: RESOURCE_MANAGERS,
  payload: _getResourceManagers(ownProps().userReducer.teamMember.id, ownProps().translationReducer.lang)
});

const _getResourceManagers = (teamMemberId, currentLanguage) => Promise.all([
  FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_RESOURCE_FIELDS)
    .then(fields => fields[SYNCUP_TYPE_RESOURCE_FIELDS]),
  PossibleValuesHelper.findAllByIdsWithoutPrefixAndCleanupPrefix(PREFIX_RESOURCE)
]).then(([rFields, possibleValuesCollection]) => ({
  resourceFieldsManager: new FieldsManager(rFields, possibleValuesCollection, currentLanguage)
}));

const _hydrateResources = (uuids, teamMemberId, resourceFieldsManager, activity) => Promise.all([
  ResourceHelper.findResourceByUuid(uuids),
  FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_RESOURCE_FIELDS)
    .then(fields => fields[SYNCUP_TYPE_RESOURCE_FIELDS])
]).then(([resources, rFields]) => {
  const rh = new ResourceHydrator(rFields);
  return rh.hydrateEntities(resources);
}).then((resources) => _flagAsFullyHydrated(resources, resourceFieldsManager, activity)).then(_mapById);

const _flagAsFullyHydrated = (resources, resourceFieldsManager, activity) => {
  const adocsMap = activity && Utils.toMapByKey(_getActivityResources(activity, false), UUID);
  resources.forEach(r => {
    r[TMP_ENTITY_VALIDATOR] = new EntityValidator(r, resourceFieldsManager, null, null);
    if (adocsMap) {
      const ar = adocsMap.get(r[UUID]);
      ar[TMP_ENTITY_VALIDATOR] = r[TMP_ENTITY_VALIDATOR];
    }
  });
  return resources;
};

const _mapById = (resources) => {
  const resourcesByUuids = {};
  resources.forEach(r => (resourcesByUuids[r[UUID]] = r));
  return resourcesByUuids;
};

const _getHydratedActivityResources = (activity, resourcesByUuid) =>
  getActivityResourceUuids(activity).map(uuid => resourcesByUuid[uuid]);

const _dehydrateAndSaveResources = (resources, teamMember, fieldsDef) => {
  const rh = new ResourceHydrator(fieldsDef);
  _cleanupTmpFields(resources);
  return rh.dehydrateEntities(resources)
    .then(() => ResourceHelper.findResourcesByUuids(resources.map(r => r[UUID])))
    .then(Utils.toMapByKey)
    .then(rMap => _getOnlyNewResources(resources, rMap, teamMember))
    .then(ResourceHelper.saveOrUpdateResourceCollection);
};

const _cleanupTmpFields = (resources) => {
  resources.forEach(r => {
    delete r[TMP_ENTITY_VALIDATOR];
  });
  return resources;
};

const _getOnlyNewResources = (resources, dbResourcesMapById, teamMember) => resources.filter(r => {
  const dbR = dbResourcesMapById.get(r[UUID]);
  const toSave = !dbR;
  if (toSave) {
    // TODO format
    r[CREATOR_EMAIL] = teamMember;
    r[TEAM] = teamMember;
  }
  return toSave;
});

export const getActivityResourceUuids = (activity) => _getActivityResources(activity, true);

const _getActivityResources = (activity, asIds = true) => {
  const resources = new Set();
  const docs = activity[AC.ACTIVITY_DOCUMENTS];
  if (docs && docs.length) {
    docs.forEach(d => resources.add((asIds && d[UUID] && d[UUID][UUID]) || d[UUID]));
  }
  return Array.from(resources);
};

export const buildNewActivityResource = (resourceFieldsManager) => {
  const resource = {};
  ResourceHelper.stampClientChange(resource);
  resource[TMP_ENTITY_VALIDATOR] = new EntityValidator(resource, resourceFieldsManager, null, []);
  return {
    [AC.DOCUMENT_TYPE]: RELATED_DOCUMENTS,
    [UUID]: resource,
  };
};
