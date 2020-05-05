import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Col, Grid, Row, Panel } from 'react-bootstrap';
import { ActivityConstants, FeatureManagerConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import styles from './funding/AFFundingDetailItem.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { M_E } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF M&E');

class AFM_E extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    const { activity } = props;
    const panels = activity[ActivityConstants.INDICATORS] ?
      activity[ActivityConstants.INDICATORS].map(e => ({ id: e.id, panelOpen: e.panelOpen ? e.panelOpen : false }))
      : [];
    this.state = { panels };
    this._handlePanelOpenClose = this._handlePanelOpenClose.bind(this);
  }

  _handlePanelOpenClose(id) {
    const { panels } = this.state;
    panels.find(p => p.id === id).panelOpen = !panels.find(p => p.id === id).panelOpen;
    this.setState({ panels });
  }

  render() {
    const { activity } = this.props;
    const { panels } = this.state;
    const indicators = activity[ActivityConstants.INDICATORS];
    const sections = [ActivityConstants.BASE, ActivityConstants.TARGET, ActivityConstants.REVISED,
      ActivityConstants.CURRENT];
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={12} lg={12} >
            {indicators.map(i => {
              logger.error(i);
              return (<Panel
                key={Math.random()} expanded={panels.find(p => p.id === i.id).panelOpen}
                collapsible header={i[ActivityConstants.INDICATOR].value}
                onSelect={this._handlePanelOpenClose.bind(null, i.id)}>
                <div>
                  <AFField
                    parent={i} fieldPath={`${ActivityConstants.INDICATORS}~${ActivityConstants.LOG_FRAME}`}
                    fmPath={FeatureManagerConstants.ME_ITEM_LOGFRAME_CATEGORY} />
                  <hr />
                  {sections.map(s => (i[s] ? <table className={styles.full_width} key={Math.random()}><tbody>
                    <tr>
                      <td className={styles.row}>
                        <div className={styles.row}>
                          <AFField
                            parent={i[s]}
                            customLabel={`${s} value`}
                            className={styles.cell_2}
                            fieldPath={`${ActivityConstants.INDICATORS}~${s}~${ActivityConstants.INDICATOR_VALUE}`} />
                          <AFField
                            parent={i[s]}
                            customLabel={`${s} date`}
                            className={styles.cell_2}
                            fieldPath={`${ActivityConstants.INDICATORS}~${s}~${ActivityConstants.INDICATOR_DATE}`} />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className={styles.row}>
                          <AFField
                            parent={i[s]}
                            customLabel={`${s} comment`}
                            fieldPath={`${ActivityConstants.INDICATORS}~${s}~${ActivityConstants.INDICATOR_COMMENT}`} />
                        </div>
                      </td>
                    </tr>
                  </tbody></table> : null))}
                </div>
                <AFField parent={i} fieldPath={`${ActivityConstants.INDICATORS}~${ActivityConstants.RISK}`} />
              </Panel>);
            })}
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFM_E, M_E);

