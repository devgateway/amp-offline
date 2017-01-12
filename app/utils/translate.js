import i18next from 'i18next';

export default (k) => {
  let ret = i18next.t(k);
  if (ret === undefined) {
    ret = k;
    console.error(`Missing translation for: ${k}`);
  }
  console.log(`translate ${k}  ${ret}`);
  return ret;
};
