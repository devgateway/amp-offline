import React, { Component, PropTypes } from 'react';
import { Modal, FormGroup, Radio, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import translate from '../../../utils/translate';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Activity Form Save Dialog
 * @author Nadejda Mandrescu
 */
export default class AFSaveDialog extends Component {

  static propTypes = {
    teamMemberId: PropTypes.number.isRequired,
    actionTitle: PropTypes.string.isRequired,
    activity: PropTypes.object.isRequired,
    saveActivity: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = { showDialog: false, goToDesktop: true };
  }

  componentWillMount() {
    this.open();
  }

  componentWillReceiveProps() {
    this.open();
  }

  getProceedContent() {
    if (this.state.goToDesktop === true) {
      const desktopURL = `/desktop/${this.props.teamMemberId}`;
      return <Link to={desktopURL}>{this.props.actionTitle}</Link>;
    } else {
      return this.props.actionTitle;
    }
  }

  handleChange(e) {
    // the initial boolean value is later on sent as string, however I am still keeping boolean comparison just in case
    const goToDesktop = e.target.value === 'true' || e.target.value === true;
    this.setState({ goToDesktop });
  }

  open() {
    this.setState({ showDialog: true, goToDesktop: true });
  }

  proceed() {
    this.props.saveActivity(this.props.activity);
    this.close();
  }

  close() {
    this.setState({ showDialog: false });
  }

  render() {
    const option1 = this.state.goToDesktop;

    return (
      <Modal show={this.state.showDialog} onHide={this.close.bind(this)}>
        <Modal.Header><Modal.Title>{this.props.actionTitle}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div>{translate('AFwhereToGoOnSave')}</div>
          <FormGroup onChange={this.handleChange.bind(this)} defaultValue>
            <Radio name="goTo" key defaultChecked={option1} value>{translate('Go to the desktop')}</Radio>
            <Radio name="goTo" key={false} defaultChecked={!option1} value={false}>
              {translate('Stay on the activity page')}
            </Radio>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button key="proceed" onClick={this.proceed.bind(this)}>{this.getProceedContent()}</Button>
          <Button key="cancel" onClick={this.close.bind(this)}>{translate('Cancel')}</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}
