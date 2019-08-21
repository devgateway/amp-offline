import React, { Component } from 'react';
import { ActivityConstants, FeatureManagerConstants, APIdentification, APInternalIds, APContact,
  APFundingSources, APLocation, APPlanning, APProgram, APSector, APRelatedOrganizations } from 'amp-ui';
import styles from './ActivityPreview.css';
import Logger from '../../../modules/util/LoggerManager';
import APFundingSection from './sections/funding/APFundingSection';
import APIssues from './sections/issues/APIssues';
import APStructures from './sections/APStructures';
import { APDocumentPage } from '../../../containers/ResourcePage';
import { rawNumberToFormattedString } from '../../../utils/NumberUtils';
// we need to send getActivityContactIds by props since
// each client should define how to hydrate and de-hydrate a contact
import { getActivityContactIds } from '../../../actions/ContactAction';


const logger = new Logger('AP Main group');

/**
 * Main content
 * @author Nadejda Mandrescu
 */
export default class MainGroup extends Component {

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  render() {
    // TODO (iteration 2+) hide sections that are not directly connected to a single field (e.g. planning, program)
    return (<div className={styles.main_group_container}>
      <APIdentification fmPath={FeatureManagerConstants.ACTIVITY_IDENTIFICATION} />
      <APInternalIds
        sectionPath={ActivityConstants.ACTIVITY_INTERNAL_IDS} />
      <APPlanning
        fmPath={FeatureManagerConstants.ACTIVITY_PLANNING}
        inline={false}
        fieldNameClass={styles.box_field_name} fieldValueClass={styles.box_field_value} />
      <APLocation
        sectionPath={ActivityConstants.LOCATIONS} tablify columns={ActivityConstants.ACTIVITY_LOCATION_COLS}
        fieldNameClass={styles.box_field_name} fieldValueClass={styles.box_field_value}
        rawNumberToFormattedString={rawNumberToFormattedString} />
      <APProgram
        fieldNameClass={styles.sector_title} fmPath={FeatureManagerConstants.ACTIVITY_PROGRAM}
        percentTitleClass={styles.percent_field_name} percentValueClass={styles.percent_field_value} />
      <APSector
        fieldNameClass={styles.sector_title} fieldValueClass={''} fmPath={FeatureManagerConstants.ACTIVITY_SECTORS}
        percentTitleClass={styles.percent_field_name} percentValueClass={styles.percent_field_value}
        rawNumberToFormattedString={rawNumberToFormattedString} />
      <APFundingSources
        sectionPath={ActivityConstants.TOTAL_NUMBER_OF_FUNDING_SOURCES} fieldValueClass={styles.box_field_value} />
      <APFundingSection
        fieldNameClass={styles.box_field_name} fieldValueClass={styles.box_field_value}
        sectionPath={ActivityConstants.FUNDINGS} />
      <APRelatedOrganizations
        fieldNameClass={styles.sector_title} fieldValueClass={''}
        fmPath={FeatureManagerConstants.ACTIVITY_ORGANIZATIONS}
        percentTitleClass={styles.percent_field_name} percentValueClass={styles.percent_field_value}
        rawNumberToFormattedString={rawNumberToFormattedString} />
      <APIssues sectionPath={ActivityConstants.ISSUES} />
      <APContact
        fieldNameClass={styles.hidden} fieldValueClass={styles.box_field_value_tight}
        columns={ActivityConstants.ACTIVITY_CONTACT_COLS} fmPath={FeatureManagerConstants.ACTIVITY_CONTACT}
        getActivityContactIds={getActivityContactIds}
      />
      <APStructures sectionPath={ActivityConstants.STRUCTURES} />
      <APDocumentPage
        sectionPath={ActivityConstants.ACTIVITY_DOCUMENTS}
        fieldNameClass={[styles.section_field_name, styles.noborder].join(' ')}
        fieldValueClass={[styles.section_field_value, styles.noborder].join(' ')}
      />
    </div>);
  }
}
