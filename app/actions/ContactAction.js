import ContactHelper from '../modules/helpers/ContactHelper';
import ContactHydrator from '../modules/helpers/ContactHydrator';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import { SYNCUP_TYPE_CONTACT_FIELDS } from '../utils/Constants';
import * as CC from '../utils/constants/ContactConstants';
import { ACTIVITY_CONTACT_PATHS, PREFIX_CONTACT } from '../utils/constants/FieldPathConstants';
import { CONTACT } from '../utils/constants/ActivityConstants';
import FieldsManager from '../modules/field/FieldsManager';
import PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as Utils from '../utils/Utils';

export const CONTACTS_LOAD = 'CONTACTS_LOAD';
export const CONTACTS_LOAD_PENDING = 'CONTACTS_LOAD_PENDING';
export const CONTACTS_LOAD_FULFILLED = 'CONTACTS_LOAD_FULFILLED';
export const CONTACTS_LOAD_REJECTED = 'CONTACTS_LOAD_REJECTED';
export const CONTACT_LOAD_PENDING = 'CONTACT_LOAD_PENDING';
export const CONTACT_LOAD_FULFILLED = 'CONTACT_LOAD_FULFILLED';
export const CONTACT_LOAD_REJECTED = 'CONTACT_LOAD_REJECTED';
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

export const loadHydratedContacts = (ids) => (dispatch, ownProps) => dispatch({
  type: CONTACTS_LOAD,
  payload: _hydrateContacts(ids, ownProps().userReducer.teamMember.id)
});

export const updateContact = (contact) => (dispatch) => dispatch({ type: CONTACT_LOAD_FULFILLED, actionData: contact });

export const configureContactManagers = () => (dispatch, ownProps) => dispatch({
  type: CONTACT_MANAGERS,
  payload: _getContactManagers(ownProps().userReducer.teamMember.id, ownProps().translationReducer.lang)
});

export const filterForUnhydratedByIds = (contactIds) => (dispatch, ownProps) => {
  const { contactsByIds } = ownProps().contactReducer;
  return contactIds.map(id => ([id, contactsByIds[id]])).filter(([, c]) => !c || !c.hydrated).map(([id]) => id);
};

const _getContactManagers = (teamMemberId, currentLanguage) => Promise.all([
  FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_CONTACT_FIELDS)
    .then(fields => fields[SYNCUP_TYPE_CONTACT_FIELDS]),
  PossibleValuesHelper.findAllByIdsWithoutPrefixAndCleanupPrefix(PREFIX_CONTACT)
]).then(([cFields, possibleValuesCollection]) => ({
  contactFieldsManager: new FieldsManager(cFields, possibleValuesCollection, currentLanguage)
}));

const _hydrateContacts = (ids, teamMemberId) => Promise.all([
  ContactHelper.findContactsByIds(ids),
  FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_CONTACT_FIELDS)
    .then(fields => fields[SYNCUP_TYPE_CONTACT_FIELDS])
]).then(([contacts, cFields]) => {
  const ch = new ContactHydrator(cFields);
  return ch.hydrateEntities(contacts);
}).then(_flagAsFullyHydrated).then(_mapById);

const _flagAsFullyHydrated = (contacts) => {
  contacts.forEach(c => (c.hydrated = true));
  return contacts;
};

const _findContactsAsSummary = (contactIdsToExclude = []) => {
  contactIdsToExclude = contactIdsToExclude.map(id => +id);
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

export const getActivityContacts = (activity) => {
  const contactsIds = [];
  ACTIVITY_CONTACT_PATHS.forEach(cType => {
    const cs = activity[cType];
    if (cs && cs.length) {
      // contact may be eventually hydrated
      contactsIds.push(...cs.map(c => c[CONTACT].id || c[CONTACT]));
    }
  });
  return contactsIds;
};
