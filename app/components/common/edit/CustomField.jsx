import React, { Component } from 'react';
import Logger from '../../../modules/util/LoggerManager';
import AFField from '../../activity/edit/components/AFField';

const logger = new Logger('CustomField');

/**
 * Custom Field for intermediate transformations
 *
 * @author Nadejda Mandrescu
 */
const CustomField = (ActualType, customPropsConverter, afFieldPropsConverter) =>
  class extends Component {
    constructor(props) {
      super(props);
      logger.debug('constructor');
    }

    render() {
      const afFieldPorps = afFieldPropsConverter ? afFieldPropsConverter(this.props) : this.props;
      const customProps = customPropsConverter ? customPropsConverter(this.props) : this.props;

      return (
        <AFField {...afFieldPorps} >
          <ActualType {...customProps} />
        </AFField>
      );
    }
  };

export default CustomField;
