import React, { Component, PropTypes } from 'react';
import { Button, FormControl, Panel } from 'react-bootstrap';
import styles from './AFSearchList.css';
import AFOption from './AFOption';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF search list');

// similar to AMP
const HIERARCHY_LEVEL_PADDING_CHAR = ' ';
const HIERARCHY_LEVEL_PADDING_SIZE = 2;

/* eslint-disable class-methods-use-this */

/**
 * Activity Form search list
 * @author Nadejda Mandrescu
 */
export default class AFSearchList extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    onSearchSelect: PropTypes.func.isRequired,
    placeholder: PropTypes.string
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.applyFilter = this.applyFilter.bind(this);
    this.state = {
      filter: '',
      values: null,
      showOptions: false
    };
  }

  componentWillMount() {
    this.initOptions(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.initOptions(nextProps);
  }

  initOptions(props) {
    props.options.forEach((option: AFOption) => {
      option.upperCaseValue = option.displayValue.toLocaleUpperCase();
    });
    this.resetState(props);
  }

  resetState(props = this.props) {
    this.setState({
      filter: '',
      values: props.options,
      showOptions: false
    });
  }

  handleSelect(value) {
    this.props.onSearchSelect(value);
  }

  applyFilter(e) {
    const filter = e.target.value;
    const searchFilter = filter.trim().toLocaleUpperCase();
    const values = this.props.options.filter(o => o.upperCaseValue.includes(searchFilter));
    this.setState({ filter, values, showOptions: true });
  }

  showOptions(e) {
    e.preventDefault();
    this.setState({ showOptions: true });
  }

  closeOptions() {
    this.resetState();
  }

  _getPaddedValue(option: AFOption) {
    if (!option.paddedValue) {
      const depth = option.displayHierarchicalValue ? 0 : (option.hierarchicalDepth || 0);
      const repeatCount = HIERARCHY_LEVEL_PADDING_SIZE * depth;
      option.paddedValue = HIERARCHY_LEVEL_PADDING_CHAR.repeat(repeatCount).concat(option.displayValue);
    }
    return option.paddedValue;
  }

  render() {
    const placeHolderText = this.props.placeholder || `${translate('Search')}...`;
    const options = React.Children.toArray(this.state.values.map(option =>
      <Button
        key={option.id} onMouseDown={this.handleSelect.bind(this, option.id)} bsClass={styles.item}
        block>
        <span>{this._getPaddedValue(option)}</span>
      </Button>));
    return (<div className={styles.searchContainer}>
      <FormControl
        type="text" placeholder={placeHolderText} onChange={this.applyFilter} value={this.state.filter}
        onFocus={this.showOptions.bind(this)} onBlur={this.closeOptions.bind(this)} />
      <div hidden={this.state.showOptions === false}>
        <Panel expanded={this.state.showOptions === true} bsClass={styles.searchPanel}>
          <Panel.Collapse>
            <Panel.Body>
              {options}
            </Panel.Body></Panel.Collapse>
        </Panel>
      </div>
    </div>);
  }
}
