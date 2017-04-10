import React, { Component, PropTypes } from 'react';
import styles from './ActivityPreview.css';
import translate from '../../../utils/translate';

/**
 * Simple Field component that consists of a field title and field value
 * @author Nadejda Mandrescu
 */
export default class SimpleField extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired, // eslint-disable-line react/forbid-prop-types
    inline: PropTypes.bool,
    useInnerHTML: PropTypes.bool,
  };

  /**
   * Gets an instance of Simple Field
   * @param trnLabel the label to translate and use as a title. This label is also used as the component key.
   * @param value the field value
   * @return {SimpleField}
   */
  static instance(trnLabel, value) {
    return <SimpleField key={trnLabel} title={translate(trnLabel)} value={value} />;
  }

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  _getValue() {
    if (this.props.useInnerHTML) {
      return <div className={styles.field_value} dangerouslySetInnerHTML={{ __html: this.props.value }} />;
    } else {
      return <div className={styles.field_value}>{this.props.value}</div>;
    }
  }

  render() {
    const fieldNameStyle = {
      display: this.props.inline === true ? 'inline' : 'block'
    };
    return (<div>
      <div className={styles.field_name} style={fieldNameStyle}>{this.props.title}</div>
      {this._getValue()}
      <hr />
    </div>);
  }
}
