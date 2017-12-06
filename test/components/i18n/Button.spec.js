/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import React from 'react';
import { shallow } from 'enzyme';
import { describe, it } from 'mocha';
import Button from '../../../app/components/i18n/Button';
import translate from '../../../app/utils/translate';

function setup() {
  const props = {
    onClick: spy(),
    text: 'test',
    className: 'test-class'
  };
  const component = shallow(
    <Button
      text={props.text} onClick={props.onClick} className={props.className}
    />);
  return {
    component,
    props,
    buttons: component.find('button')
  };
}


describe('@@ Button @@', () => {
  describe('text', () =>
    it('should translate correctly the text props.', () => {
      const { buttons, props } = setup();
      expect(buttons.at(0).text()).to.equal(translate(props.text));
    })
  );

  describe('find', () =>
    it('should use the text class from props.', () => {
      const { component, props } = setup();
      expect(component.find(`.${props.className}`)).to.have.length(1);
    })
  );

  describe('click', () =>
    it('should use the click handler from props.', () => {
      const { buttons, props } = setup();
      buttons.at(0).simulate('click');
      expect(props.onClick.called).to.be.true;
    })
  );
});
