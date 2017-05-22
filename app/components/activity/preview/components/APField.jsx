import React, { Component, PropTypes } from 'react';
import styles from '../ActivityPreview.css';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Simple Field component that consists of a field title and field value
 * @author Nadejda Mandrescu
 */
export default class APField extends Component {
  static propTypes = {
    title: PropTypes.string,
    value: PropTypes.any,
    inline: PropTypes.bool,
    useInnerHTML: PropTypes.bool,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string,
    separator: PropTypes.bool
  };

  /**
   * Gets an instance of Simple Field
   * @param trnLabel the label to translate and use as a title. This label is also used as the component key.
   * @param value the field value
   * @param inline show title and value in the same row.
   * @param separator add or not an <hr> tag.
   * @return {SimpleField}
   */
  static instance(trnLabel, value, inline = false, separator = true, nameClass, valueClass) {
    return (<APField
      key={trnLabel} title={translate(trnLabel)} value={value} inline={inline} separator={separator}
      fieldNameClass={nameClass} fieldValueClass={valueClass}/>);
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.useSeparator = this.props.separator !== false;
    this.displayClass = this.props.inline === true ? styles.inline : styles.block;
  }

  _getValue() {
    const classNames = `${this.props.fieldValueClass} ${this.displayClass}`;
    if (this.props.useInnerHTML) {
      return <div className={classNames} dangerouslySetInnerHTML={{ __html: this.props.value }} />;
    } else {
      return <div className={classNames}>{this.props.value}</div>;
    }
  }

  render() {
    const classNames = `${this.props.fieldNameClass} ${this.displayClass}`;
    return (<div className={styles.inline}>
      <div className={classNames}>{this.props.title}</div> {this._getValue()}
      {this.useSeparator ? <hr /> : ''}
    </div>);
  }
}
