import React from 'react';
import { Col, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import EntryListWrapper from '../../../../common/edit/EntryListWrapper';
import CustomField from '../../../../common/edit/CustomField';
import * as styles from './BudgetCode.css';

/**
 * Budget Code entries
 *
 * @author Nadejda Mandrescu
 */

const getEntryFunc = (parentPath, id, budget) => (
  <Row key={id}>
    <Col>
      <AFField
        parent={budget} fieldPath={`${parentPath}~${AC.BUDGET_CODE}`} showLabel={false} inline
        type={Types.INPUT_TYPE} />
    </Col>
  </Row>
);

const customPropsConverter = (props) => ({
  items: props.parent[props.fieldPath.split('~').pop()] || [],
  onEntriesChange: props.onAfterUpdate,
  wrapperContainerStyle: styles.entryWrapperContainer,
  titleAsAddButton: true,
});
const afFieldPropsConverter = (props) => ({
  ...props,
  className: styles.afField,
  type: Types.CUSTOM
});

const BudgetCode = (parentPath) => EntryListWrapper('Add New Budget', getEntryFunc.bind(null, parentPath), AC.BUDGETS);
const BudgetCodeWrapper = (parentPath) =>
  CustomField(BudgetCode(parentPath), customPropsConverter, afFieldPropsConverter);
export default BudgetCodeWrapper;
