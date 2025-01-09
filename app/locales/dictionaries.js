import 'server-only'
import enResource from '@/app/locales/enResource';
import koResource from '@/app/locales/koResource';

const dictionaries = {
  en: () => enResource.translation,
  ko: () => koResource.translation,
}

const getDictionary = async (locale) => (key) => {
  const langData = dictionaries[locale]();
  const subKeys = key.split('.');
  if(subKeys.length !== 2) return key;

  const firstKey = subKeys.at(0);
  const secondKey = subKeys.at(1);

  const firstValue = langData[firstKey];
  if (!firstValue) return key;

  const secondValue = firstValue[secondKey];
  if (!secondValue) return key;
  
  return secondValue;
}


export default getDictionary;