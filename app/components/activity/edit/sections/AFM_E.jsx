import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Col, Grid, Panel, Row, Button } from 'react-bootstrap';
import { ActivityConstants, FeatureManagerConstants, UIUtils } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import styles from './funding/AFFundingDetailItem.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { M_E } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import fundingStyles from './funding/AFFundingContainer.css';
import * as AFComponentTypes from '../components/AFComponentTypes';
import PossibleValuesHelper from '../../../../modules/helpers/PossibleValuesHelper';
import translate from '../../../../utils/translate';

const logger = new Logger('AF M&E');

class AFM_E extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    const { activity } = props;
    if (activity[ActivityConstants.INDICATORS]) {
      // eslint-disable-next-line no-return-assign
      activity[ActivityConstants.INDICATORS].forEach(i => i.panelOpen = i.panelOpen ? i.panelOpen : false);
    }
    this._handlePanelOpenClose = this._handlePanelOpenClose.bind(this);
    this.findPanel = this.findPanel.bind(this);
    this.handleAddME = this.handleAddME.bind(this);
  }

  _handlePanelOpenClose(id) {
    const open = this.findPanel(id).panelOpen;
    this.findPanel(id).panelOpen = !open;
    this.forceUpdate();
  }

  findPanel(id) {
    const { activity } = this.props;
    return activity[ActivityConstants.INDICATORS].find(p => p.id === id);
  }

  handleAddME(id) {
    return PossibleValuesHelper.findById(`${ActivityConstants.INDICATORS}~${ActivityConstants.INDICATOR}`)
      .then(data => {
        const { activity } = this.props;
        const indicators = activity[ActivityConstants.INDICATORS] || [];
        if (!indicators.find(i => i.indicator.id === id)) {
          const indicator = {
            actual: {
              comment: null,
              date: null,
              value: null
            },
            base: {
              comment: null,
              date: null,
              value: null
            },
            revised: {
              comment: null,
              date: null,
              value: null
            },
            target: {
              comment: null,
              date: null,
              value: null
            },
            risk: null,
            panelOpen: true,
            log_frame: null,
            indicator: data['possible-options'][id],
            id: UIUtils.numberRandom()
          };
          indicators.push(indicator);
        }
        activity[ActivityConstants.INDICATORS] = indicators;
        this.forceUpdate();
        return true;
      });
  }

  deletedIndicator(id) {
    const doDelete = confirm(translate('deleteIndicatorConfirm'));
    if (!doDelete) {
      return false;
    }
    const { activity } = this.props;
    const indicators = activity[ActivityConstants.INDICATORS];
    let i = -1;
    indicators.forEach((indicator, j) => {
      if (indicator.id === id) {
        i = j;
      }
    });
    indicators.splice(i, 1);
    activity[ActivityConstants.INDICATORS] = indicators;
    this.forceUpdate();
  }

  render() {
    const { activity } = this.props;
    const indicators = activity[ActivityConstants.INDICATORS] || [];
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={12} lg={12}>
            {indicators.map(i => {
              const errors = ActivityConstants.ME_SECTIONS.some(j => i[j] && i[j].errors && i[j].errors.length > 0);
              return (
                <Panel
                  key={Math.random()} expanded={this.findPanel(i.id).panelOpen}
                  className={errors ? fundingStyles.error : ''}>
                  <Panel.Heading>
                    <Panel.Title
                      toggle
                      onClick={this._handlePanelOpenClose.bind(null, i.id)}
                    >{i[ActivityConstants.INDICATOR].value}</Panel.Title>
                  </Panel.Heading>
                  <div>
                    <AFField
                      parent={i} fieldPath={`${ActivityConstants.INDICATORS}~${ActivityConstants.LOG_FRAME}`}
                      fmPath={FeatureManagerConstants.ME_ITEM_LOGFRAME_CATEGORY} />
                    <hr />
                    {ActivityConstants.ME_SECTIONS
                      .map(s => (i[s] ? <table className={styles.full_width} key={Math.random()}>
                        <tbody>
                          <tr>
                            <td className={styles.row}>
                              <div className={styles.row}>
                                <AFField
                                  parent={i[s]}
                                  customLabel={`${s} value`}
                                  className={styles.cell_2}
                                // eslint-disable-next-line max-len
                                  fieldPath={`${ActivityConstants.INDICATORS}~${s}~${ActivityConstants.INDICATOR_VALUE}`} />
                                <AFField
                                  parent={i[s]}
                                  customLabel={`${s} date`}
                                  className={styles.cell_2}
                                // eslint-disable-next-line max-len
                                  fieldPath={`${ActivityConstants.INDICATORS}~${s}~${ActivityConstants.INDICATOR_DATE}`} />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className={styles.row}>
                                <AFField
                                  parent={i[s]}
                                // eslint-disable-next-line max-len
                                  fieldPath={`${ActivityConstants.INDICATORS}~${s}~${ActivityConstants.INDICATOR_COMMENT}`}
                                  customLabel={`${s} comment`} type={AFComponentTypes.TEXT_AREA} />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table> : null))}
                  </div>
                  <AFField parent={i} fieldPath={`${ActivityConstants.INDICATORS}~${ActivityConstants.RISK}`} />
                  <Button
                    bsStyle="primary"
                    key={Math.random()}
                    onClick={() => this.deletedIndicator(i.id)}>{translate('Delete Indicator')}
                  </Button>
                </Panel>
              );
            })}
          </Col>
        </Row>
        <Col md={12} lg={12}>
          <AFField
            parent={this.props.activity}
            fieldPath={`${ActivityConstants.INDICATORS}~${ActivityConstants.INDICATOR}`}
            type={AFComponentTypes.SEARCH} onAfterUpdate={this.handleAddME}
            extraParams={{ placeholder: translate('Search') }} />
        </Col>
        <Row />
      </Grid>
    </div>)
      ;
  }
}

export default AFSection(AFM_E, M_E);
