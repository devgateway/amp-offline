/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import * as styles from './EntryList.css';
import * as listStyles from '../../activity/edit/components/AFList.css';
import * as afStyles from '../../activity/edit/ActivityForm.css';
import AFLabel from '../../activity/edit/components/AFLabel';
import translate from '../../../utils/translate';


/**
 * A generic list of entries that allows to add/remove entries, while the entry init/edit is handled elsewhere
 *
 * @author Nadejda Mandrescu
 */
export default class EntryList extends Component {
  static propTypes = {
    label: PropTypes.string,
    children: PropTypes.array.isRequired,
    childrenIds: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    className: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    titleAsAddButton: PropTypes.bool,
  };

  static defaultProps = {
    titleAsAddButton: false,
  };

  getChildren() {
    const { children, childrenIds } = this.props;
    const entries = [];
    for (let idx = 0; idx < children.length; idx++) {
      const child = children[idx];
      const cId = childrenIds[idx];
      entries.push(
        <div key={cId}>
          <span className={styles.data}>{child}</span>
          <span className={styles.deleteCol}>
            <a onClick={() => this.props.onRemove(cId)} className={listStyles.delete} href={null} />
          </span>
        </div>
      );
    }
    return entries;
  }

  getAddSection() {
    const { label, onAdd, titleAsAddButton } = this.props;
    if (titleAsAddButton) {
      return <Button bsStyle="success" onClick={onAdd}>{translate(label)}</Button>;
    }
    return (
      <span>
        {label &&
        <AFLabel value={label} className={[afStyles.label_highlight, afStyles.activity_form_control].join(' ')} />}
        <span className={styles.addButton}><a onClick={onAdd} href={null} /></span>
      </span>
    );
  }

  render() {
    return (
      <div className={styles.entryList}>
        {this.getAddSection()}
        <div className={this.props.className}>
          {this.getChildren()}
        </div>
      </div>
    );
  }
}
