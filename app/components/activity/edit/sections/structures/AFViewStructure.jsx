import React, { Component, PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import translate from '../../../../../utils/translate';
import Logger from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as styles from '../../AFSaveDialog.css';
import * as stylesStructure from './AFViewStructure.css';

const logger = new Logger('AF view structure dialog');

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
 * Activity Form View Structure Dialog
 * @author Gabriel Inchauspe
 */
export default class AFViewStructure extends Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    structure: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      showDialog: props.show || false,
      paddingTop: 0
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.show) {
      this.open();
    }
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

  open() {
    this.setState({ showDialog: true });
  }

  close() {
    this.setState({ showDialog: false });
    this.props.onClose();
    window.removeEventListener('resize', this.windowResizeListener);
  }

  render() {
    const { paddingTop, showDialog } = this.state;
    const buttonProps = {
      bsStyle: 'primary',
      block: true
    };
    if (!this.props.structure) {
      return null;
    }
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
            {translate('Coordinates')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <table>
              <thead>
                <tr>
                  <th>{translate('Latitude')}</th>
                  <th>{translate('Longitude')}</th>
                </tr>
              </thead>
              <tbody>
                {this.props.structure[AC.STRUCTURES_COORDINATES].map(c => (
                  <tr key={Math.random()}>
                    <td className={stylesStructure.coordinates}>{c[AC.STRUCTURES_LATITUDE]}</td>
                    <td className={stylesStructure.coordinates}>{c[AC.STRUCTURES_LONGITUDE]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.save_as_draft_footer}>
          <Button onClick={this.close.bind(this)} className={styles.save_as_draft_button} {...buttonProps}>
            {translate('Close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
