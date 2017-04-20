import Section from './Section';
import APPercentageList from '../components/APPercentageList';
import { NATIONAL_PLAN_OBJECTIVE, PROGRAM, PROGRAM_PERCENTAGE } from '../../../../utils/constants/ActivityConstants';

const APNationalPlanObjective = Section(APPercentageList(NATIONAL_PLAN_OBJECTIVE, PROGRAM, PROGRAM_PERCENTAGE),
'National Plan');

export default APNationalPlanObjective;

