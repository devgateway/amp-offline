import * as AC from './ActivityConstants';

/**
 * This is a set of field paths that are used for frequent needs
 * @author Nadejda Mandrescu
 */

export const FUNDING_ACTIVE_LIST = 'fundings~active_list';
export const FUNDING_DETAILS_PATH = 'fundings~funding_details';
export const FUNDING_CURRENCY_PATH = 'fundings~funding_details~currency';
export const ADJUSTMENT_TYPE_PATH = 'fundings~funding_details~adjustment_type';
export const TRANSACTION_TYPE_PATH = 'fundings~funding_details~transaction_type';
export const ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH = 'activity_internal_ids~internal_id';
export const LOCATION_PATH = 'locations~location';
export const NATIONAL_PLAN_OBJECTIVE_PATH = 'national_plan_objective~program';
export const PRIMARY_PROGRAM_PATH = 'primary_programs~program';
export const SECONDARY_PROGRAM_PATH = 'secondary_programs~program';
export const PRIMARY_SECTOR_PATH = 'primary_sectors~sector';
export const SECONDARY_SECTOR_PATH = 'secondary_sectors~sector';
export const TERTIARY_SECTOR_PATH = 'tertiary_sectors~sector';
export const DONOR_ORGANIZATIONS_PATH = 'donor_organization~organization';

export const RICH_TEXT_FIELDS = new Set([AC.STATUS_REASON, AC.OBJECTIVE, AC.DESCRIPTION, AC.PROJECT_COMMENTS,
  AC.LESSONS_LEARNED, AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.CONDITIONALITIES, AC.PROJECT_MANAGEMENT,
]);

export const PATHS_WITH_TREE_STRUCTURE = new Set([NATIONAL_PLAN_OBJECTIVE_PATH, PRIMARY_PROGRAM_PATH,
  SECONDARY_PROGRAM_PATH, PRIMARY_SECTOR_PATH, SECONDARY_SECTOR_PATH, TERTIARY_SECTOR_PATH]);
