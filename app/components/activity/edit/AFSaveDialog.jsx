import React, { Component, PropTypes } from 'react';
import { Modal, FormGroup, Radio, Button } from 'react-bootstrap';
import translate from '../../../utils/translate';
import Logger from '../../../modules/util/LoggerManager';
import * as styles from './AFSaveDialog.css';

const logger = new Logger('AF save dialog');

/*
   Takes a function and a delay(in ms) and returns a debouncing function that will only
   call the original function if the specified amount of time has passed since
   its(debouncing function's) last call.
   Useful for things such as window resize.
*/

function debounce(cb, delay = 200) {
  let timeout = null;
  return () => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(cb, delay);
  };
}

/**
 * Activity Form Save Dialog
 * @author Nadejda Mandrescu
 */
export default class AFSaveDialog extends Component {

  static propTypes = {
    actionTitle: PropTypes.string.isRequired,
    saveActivity: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      showDialog: false,
      goToDesktop: true,
      paddingTop: 0
    };
  }

  componentWillMount() {
    this.open();
  }

  componentWillReceiveProps() {
    this.open();
  }

  onShow() {
    this.recalcPaddingTop();
    this.windowResizeListener = debounce(this.recalcPaddingTop.bind(this));
    window.addEventListener('resize', this.windowResizeListener);
  }

  recalcPaddingTop() {
    const el = document.querySelector('.modal-dialog');
    if (!el) return;
    this.setState({
      paddingTop: (window.innerHeight - el.clientHeight) / 2
    });
  }

  handleChange(e) {
    // the initial boolean value is later on sent as string, however I am still keeping boolean comparison just in case
    const goToDesktop = e.target.value === 'true' || e.target.value === true;
    this.setState({ goToDesktop });
  }

  open() {
    this.setState({ showDialog: true, goToDesktop: true });
  }

  proceed(goToDesktop) {
    this.props.saveActivity(goToDesktop);
    this.close();
  }

  close() {
    this.setState({ showDialog: false });
    this.props.onClose();
    window.removeEventListener('resize', this.windowResizeListener);
  }

  render() {
    const { goToDesktop, paddingTop, showDialog } = this.state;

    const buttonProps = {
      bsSize: 'xsmall',
      bsStyle: 'primary',
      block: true
    };

    return (
      <Modal
        show={showDialog}
        onShow={this.onShow.bind(this)}
        onHide={this.close.bind(this)}
        style={{ paddingTop }}
        bsClass={`${styles.save_as_draft} modal`}
        bsSize="small"
      >
        <Modal.Header closeButton className={styles.save_as_draft_header}>
          <Modal.Title className={styles.save_as_draft_header_title}>
            {this.props.actionTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{translate('AFwhereToGoOnSave')}</div>
          <FormGroup onChange={this.handleChange.bind(this)} defaultValue>
            <Radio name="goTo" key defaultChecked={goToDesktop} value>{translate('Go to the desktop')}</Radio>
            <Radio name="goTo" key={false} defaultChecked={!goToDesktop} value={false}>
              {translate('Stay on the activity page')}
            </Radio>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer className={styles.save_as_draft_footer}>
          <Button
            onClick={this.proceed.bind(this, goToDesktop)} className={styles.save_as_draft_button} {...buttonProps}>
            {this.props.actionTitle}
          </Button>
          <Button onClick={this.close.bind(this)} className={styles.save_as_draft_button} {...buttonProps}>
            {translate('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

}
