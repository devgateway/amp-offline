import equal from 'fast-deep-equal';
import ContactHelper from '../modules/helpers/ContactHelper';
import ContactHydrator from '../modules/helpers/ContactHydrator';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import { SYNCUP_TYPE_CONTACT_FIELDS } from '../utils/Constants';
import * as CC from '../utils/constants/ContactConstants';
import * as AC from '../utils/constants/ActivityConstants';
import { ACTIVITY_CONTACT_PATHS, PREFIX_CONTACT } from '../utils/constants/FieldPathConstants';
import FieldsManager from '../modules/field/FieldsManager';
import PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as Utils from '../utils/Utils';
import EntityValidator from '../modules/field/EntityValidator';

export const CONTACTS_LOAD = 'CONTACTS_LOAD';
export const CONTACTS_LOAD_PENDING = 'CONTACTS_LOAD_PENDING';
export const CONTACTS_LOAD_FULFILLED = 'CONTACTS_LOAD_FULFILLED';
export const CONTACTS_LOAD_REJECTED = 'CONTACTS_LOAD_REJECTED';
export const CONTACT_LOAD_PENDING = 'CONTACT_LOAD_PENDING';
export const CONTACT_LOAD_FULFILLED = 'CONTACT_LOAD_FULFILLED';
export const CONTACT_LOAD_REJECTED = 'CONTACT_LOAD_REJECTED';
export const CONTACTS_SAVE = 'CONTACTS_SAVE';
export const CONTACTS_SAVE_PENDING = 'CONTACTS_SAVE_PENDING';
export const CONTACTS_SAVE_FULFILLED = 'CONTACTS_SAVE_FULFILLED';
export const CONTACTS_SAVE_REJECTED = 'CONTACTS_SAVE_REJECTED';
export const CONTACT_MANAGERS = 'CONTACT_MANAGERS';
export const CONTACT_MANAGERS_PENDING = 'CONTACT_MANAGERS_PENDING';
export const CONTACT_MANAGERS_FULFILLED = 'CONTACT_MANAGERS_FULFILLED';
export const CONTACT_MANAGERS_REJECTED = 'CONTACT_MANAGERS_REJECTED';
export const CONTACTS_UNLOADED = 'CONTACTS_UNLOADED';

export const loadAllSummaryContacts = () => (dispatch) => dispatch({
  type: CONTACTS_LOAD,
  payload: _findContactsAsSummary()
});

export const loadSummaryForNotLoadedContacts = () => (dispatch, ownProps) => dispatch({
  type: CONTACTS_LOAD,
  payload: _findContactsAsSummary(Object.keys(ownProps().contactReducer.contactsByIds))
});

export const unloadContacts = () => (dispatch) => dispatch({ type: CONTACTS_UNLOADED });

export const loadHydratedContactsForActivity = (activity) => (dispatch, ownProps) => {
  const unhydratedIds = filterForUnhydratedByIds(getActivityContactIds(activity))(dispatch, ownProps);
  return configureContactManagers()(dispatch, ownProps)
    .then(() => loadHydratedContacts(unhydratedIds)(dispatch, ownProps));
};

export const loadHydratedContacts = (ids) => (dispatch, ownProps) => dispatch({
  type: CONTACTS_LOAD,
  payload: _hydrateContacts(ids, ownProps().userReducer.teamMember.id, ownProps().contactReducer.contactFieldsManager,
    ownProps().activityReducer.activity)
});

export const updateContact = (contact) => (dispatch) => dispatch({ type: CONTACT_LOAD_FULFILLED, actionData: contact });

export const dehydrateAndSaveActivityContacts = (activity) => (dispatch, ownProps) => dispatch({
  type: CONTACTS_SAVE,
  payload: _dehydrateAndSaveContacts(_getHydratedActivityContacts(activity, ownProps().contactReducer.contactsByIds),
    ownProps().userReducer.teamMember.id,
    ownProps().contactReducer.contactFieldsManager.fieldsDef)
});

export const configureContactManagers = () => (dispatch, ownProps) => dispatch({
  type: CONTACT_MANAGERS,
  payload: _getContactManagers(ownProps().userReducer.teamMember.id, ownProps().translationReducer.lang)
});

export const filterForUnhydratedByIds = (contactIds) => (dispatch, ownProps) => {
  const { contactsByIds } = ownProps().contactReducer;
  return contactIds.map(id => ([id, contactsByIds[id]])).filter(([, c]) => !c || !c[CC.TMP_HYDRATED]).map(([id]) => id);
};

const _getContactManagers = (teamMemberId, currentLanguage) => Promise.all([
  FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_CONTACT_FIELDS)
    .then(fields => fields[SYNCUP_TYPE_CONTACT_FIELDS]),
  PossibleValuesHelper.findAllByIdsWithoutPrefixAndCleanupPrefix(PREFIX_CONTACT)
]).then(([cFields, possibleValuesCollection]) => ({
  contactFieldsManager: new FieldsManager(cFields, possibleValuesCollection, currentLanguage)
}));

const _hydrateContacts = (ids, teamMemberId, contactFieldsManager, activity) => Promise.all([
  ContactHelper.findContactsByIds(ids),
  FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_CONTACT_FIELDS)
    .then(fields => fields[SYNCUP_TYPE_CONTACT_FIELDS])
]).then(([contacts, cFields]) => {
  const ch = new ContactHydrator(cFields);
  return ch.hydrateEntities(contacts);
}).then((contacts) => _flagAsFullyHydrated(contacts, contactFieldsManager, activity)).then(_mapById);

const _flagAsFullyHydrated = (contacts, contactFieldsManager, activity) => {
  const aCsMap = activity && Utils.toMapByKey(_getActivityContacts(activity, false));
  contacts.forEach(c => {
    const skipValidationFor = ContactHelper.isNewContact(c) ? ['id'] : null;
    c[CC.TMP_HYDRATED] = true;
    c[CC.TMP_ENTITY_VALIDATOR] = new EntityValidator(c, contactFieldsManager, null, skipValidationFor);
    if (aCsMap) {
      const aCs = aCsMap.get(c.id);
      aCs[CC.TMP_ENTITY_VALIDATOR] = c[CC.TMP_ENTITY_VALIDATOR];
    }
  });
  return contacts;
};

const _findContactsAsSummary = (contactIdsToExclude = []) => {
  contactIdsToExclude = contactIdsToExclude.map(id => {
    const nId = +id;
    return Number.isNaN(nId) ? id : nId;
  });
  const filter = contactIdsToExclude.length ? Utils.toMap('id', { $nin: contactIdsToExclude }) : {};
  const projections = { id: 1 };
  projections[CC.NAME] = 1;
  projections[CC.LAST_NAME] = 1;
  return ContactHelper.findAllContacts(filter, projections).then(_mapById);
};

const _mapById = (contacts) => {
  const contactsByIds = {};
  contacts.forEach(c => (contactsByIds[c.id] = c));
  return contactsByIds;
};

const _dehydrateAndSaveContacts = (contacts, teamMemberId, fieldsDef) => {
  const ch = new ContactHydrator(fieldsDef);
  _cleanupLocalFields(contacts);
  return ch.dehydrateEntities(contacts)
    .then(() => ContactHelper.findContactsByIds(contacts.map(c => c.id)))
    .then(Utils.toMapByKey)
    .then(cMap => _getOnlyModifiedContacts(contacts, cMap, teamMemberId))
    .then(ContactHelper.saveOrUpdateContactCollection);
};

// TODO AMP-27748 until contacts API rejects extra fields (contrary to activity API), we are cleaning them up
const _cleanupLocalFields = (contacts) => {
  contacts.forEach(c => {
    CC.TMP_FIELDS.forEach(tmpProp => delete c[tmpProp]);
    (c[CC.ORGANISATION_CONTACTS] || []).forEach(o => delete o[CC.TMP_UNIQUE_ID]);
  });
  return contacts;
};

const _getOnlyModifiedContacts = (contacts, dbContactsMapById, teamMemberId) => contacts.filter(c => {
  const dbC = dbContactsMapById.get(c.id);
  const toUpdate = !dbC || !equal(c, dbC);
  if (toUpdate) {
    if (ContactHelper.isNewContact(c) && !c[CC.CREATOR]) {
      c[CC.CREATOR] = teamMemberId;
    }
    ContactHelper.stampClientChange(c);
  }
  return toUpdate;
});

const _getHydratedActivityContacts = (activity, contactsById) =>
  getActivityContactIds(activity).map(id => contactsById[id]);

export const getActivityContactIds = (activity) => _getActivityContacts(activity, true);

const _getActivityContacts = (activity, asIds = true) => {
  const contactsIds = new Set();
  ACTIVITY_CONTACT_PATHS.forEach(cType => {
    const cs = activity[cType];
    if (cs && cs.length) {
      // contact may be eventually hydrated
      cs.forEach(c => contactsIds.add((asIds && c[AC.CONTACT].id) || c[AC.CONTACT]));
    }
  });
  return Array.from(contactsIds);
};

export const buildNewActivityContact = (contactFieldsManager) => {
  const contact = {};
  ContactHelper.stampClientChange(contact);
  contact[CC.TMP_HYDRATED] = true;
  contact[CC.TMP_ENTITY_VALIDATOR] = new EntityValidator(contact, contactFieldsManager, null, ['id']);
  return {
    [AC.CONTACT]: contact,
    [AC.PRIMARY_CONTACT]: false,
  };
};
