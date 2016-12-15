/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {spy} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import Span from '../../../app/components/i18n/Span.jsx';
import translate from '../../../app/utils/translate';

function setup() {
  const props = {
    text: 'test',
    className: 'test-class'
  };
  const component = shallow(<Span text={props.text} className={props.className}/>);
  return {
    component,
    props,
    spans: component.find('span')
  };
}


describe('@@ Span @@', () => {
  it('Should translate correctly the text props.', () => {
    const {spans, props} = setup();
    expect(spans.at(0).text()).to.equal(translate(props.text));
  });

  it('Should use the text class from props.', () => {
    const {component, props} = setup();
    expect(component.find('.' + props.className)).to.have.length(1);
  });
});
