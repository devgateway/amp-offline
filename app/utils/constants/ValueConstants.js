/**
 * @author Nadejda Mandrescu
 */

import * as AC from './ActivityConstants';

export const DONOR_ORGANIZATION = 'Donor Organization';
export const RESPONSIBLE_ORGANIZATION = 'Responsible Organization';
export const EXECUTING_AGENCY = 'Executing Agency';
export const IMPLEMENTING_AGENCY = 'Implementing Agency';
export const BENEFICIARY_AGENCY = 'Beneficiary Agency';
export const CONTRACTING_AGENCY = 'Contracting Agency';
export const DONOR_AGENCY = 'Donor';
export const REGIONAL_GROUP = 'Regional Group';
export const SECTOR_GROUP = 'Sector Group';

export const ORG_ROLE_NAMES = [DONOR_ORGANIZATION, RESPONSIBLE_ORGANIZATION, EXECUTING_AGENCY, IMPLEMENTING_AGENCY,
  BENEFICIARY_AGENCY, CONTRACTING_AGENCY, REGIONAL_GROUP, SECTOR_GROUP];

export const ACTUAL = 'Actual';
export const PLANNED = 'Planned';
export const COMMITMENTS = 'Commitments';
export const DISBURSEMENTS = 'Disbursements';
export const EXPENDITURES = 'Expenditures';
export const ACTUAL_COMMITMENTS = `${ACTUAL} ${AC.COMMITMENTS}`;
export const ACTUAL_DISBURSEMENTS = `${ACTUAL} ${AC.DISBURSEMENTS}`;
export const ACTUAL_EXPENDITURES = `${ACTUAL} ${AC.EXPENDITURES}`;
export const PLANNED_COMMITMENTS = `${PLANNED} ${AC.COMMITMENTS}`;
export const PLANNED_DISBURSEMENTS = `${PLANNED} ${AC.DISBURSEMENTS}`;
export const PLANNED_EXPENDITURES = `${PLANNED} ${AC.EXPENDITURES}`;
export const UNALLOCATED_DISBURSEMENTS = 'Unallocated Disbursements';
export const DELIVERY_RATE = 'Delivery rate';
export const MTEF_PROJECTIONS = 'MTEF Projections';

export const ADJUSTMENT_TYPES = [ACTUAL, PLANNED];
export const ADJUSTMENT_TYPES_AP_ORDER = [PLANNED, ACTUAL];

export const NEW_ACTIVITY_ID = '0';

export const PROPOSED_PROJECT_COST = 'ppc';
export const REVISED_PROJECT_COST = 'rpc';

export const ACRONYM_DONOR_ORGANIZATION = 'DN';
export const ACRONYM_EXECUTING_AGENCY = 'EA';
export const ACRONYM_IMPLEMENTING_AGENCY = 'IA';
export const ACRONYM_BENEFICIARY_AGENCY = 'BA';
export const ACRONYM_RESPONSIBLE_ORGANIZATION = 'RO';

/** Approval status untranslated values **/
export const APPROVAL_STATUS_CREATED = 'created';
export const APPROVAL_STATUS_APPROVED = 'approved';
export const APPROVAL_STATUS_EDITED = 'edited';
export const APPROVAL_STATUS_STARTED_APPROVED = 'startedapproved';
export const APPROVAL_STATUS_STARTED = 'started';
export const APPROVAL_STATUS_NOT_APPROVED = 'not_approved';
export const APPROVAL_STATUS_REJECTED = 'rejected';

export const ON_BUDGET = 'On Budget';

export const INTERNATIONAL = 'International';
export const COUNTRY = 'Country';

export const RELATED_DOCUMENTS = 'Related Documents';

export const TMP_ENTITY_VALIDATOR = 'entity-validator';

/** Required status */
export const ALWAYS_REQUIRED = 'Y';
