import React, { Component, PropTypes } from 'react';
import { Button, FormControl, Panel } from 'react-bootstrap';
import styles from './AFSearchList.css';
import AFOption from './AFOption';
import { HIERARCHICAL_VALUE_DEPTH } from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

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
    onSearchSelect: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.applyFilter = this.applyFilter.bind(this);
    this.toggleShowOptions = this.toggleShowOptions.bind(this);
    this.state = {
      filter: '',
      values: null,
      showOptions: false
    };
  }

  componentWillMount() {
    this.props.options.forEach(option => {
      option.upperCaseValue = option.translatedValue.toLocaleUpperCase();
    });
    this.resetState();
  }

  resetState() {
    this.setState({
      filter: '',
      values: this.props.options,
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

  toggleShowOptions(e) {
    e.preventDefault();
    if (this.state.showOptions === true) {
      this.resetState();
    } else {
      this.setState({ showOptions: true });
    }
  }

  _getPaddedValue(option: AFOption) {
    if (!option.paddedValue) {
      const repeatCount = HIERARCHY_LEVEL_PADDING_SIZE * (option[HIERARCHICAL_VALUE_DEPTH] || 0);
      option.paddedValue = HIERARCHY_LEVEL_PADDING_CHAR.repeat(repeatCount).concat(option.translatedValue);
    }
    return option.paddedValue;
  }

  render() {
    const placeHolderText = `${translate('Search')}...`;
    const options = React.Children.toArray(this.state.values.map(option =>
      <Button
        key={option.id} onMouseDown={this.handleSelect.bind(this, option.id)} bsClass={styles.item}
        block >
        <span>{this._getPaddedValue(option)}</span>
      </Button>));
    return (<div className={styles.searchContainer} >
      <FormControl
        type="text" placeholder={placeHolderText} onChange={this.applyFilter} value={this.state.filter}
        onFocus={this.toggleShowOptions} onBlur={this.toggleShowOptions} />
      <div hidden={this.state.showOptions === false} >
        <Panel collapsible expanded={this.state.showOptions === true} bsClass={styles.searchPanel} >
          {options}
        </Panel>
      </div>
    </div>);
  }
}
