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
    if (activity[ActivityConstants.INDICATORS]) {
      // eslint-disable-next-line no-return-assign
      activity[ActivityConstants.INDICATORS].forEach(i => i.panelOpen = i.panelOpen ? i.panelOpen : false);
    }
    this._handlePanelOpenClose = this._handlePanelOpenClose.bind(this);
    this.findPanel = this.findPanel.bind(this);
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

  render() {
    const { activity } = this.props;
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
                key={Math.random()} expanded={this.findPanel(i.id).panelOpen}
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

