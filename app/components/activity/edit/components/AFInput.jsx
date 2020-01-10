import AFTextArea from './AFTextArea';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF input');

/**
 * Activity Form Text Area component
 * @author ginchauspe
 */
export default class AFInput extends AFTextArea {

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.componentClass = 'input';
    this.type = 'text';
    this.state = {
      value: ''
    };
  }

}
