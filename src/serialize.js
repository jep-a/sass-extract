import { toColorHex } from './util';
import parseColor from 'parse-color';

/**
 * Serialize a given sass color into a color name like 'white', an rgba(r,g,b,a), or #000000 string
 * based on the color provided
 */
function serializeColor(sassColor) {
  const alpha = Math.round(sassColor.getA() * 100) / 100;
  const r = Math.round(sassColor.getR());
  const g = Math.round(sassColor.getG());
  const b = Math.round(sassColor.getB());

  if(alpha < 0.999) {
    return `rgba(${r},${g},${b},${alpha})`;
  } else {
    const hex = `#${toColorHex(r)}${toColorHex(g)}${toColorHex(b)}`;
    const parsedColor = parseColor(hex);
    if(parsedColor.keyword != null) {
      return parsedColor.keyword;
    } else {
      return hex;
    }
  }
}

/**
 * Transform a SassValue into a serialized string
 */
function serializeValue(sassValue, isInList, sass) {
  const type = sassValue.constructor.name;

  switch(type) {
    case 'SassString':
    case 'SassBoolean':
      return `${sassValue.getValue()}`;

    case 'SassNumber':
      return `${sassValue.getValue()}${sassValue.getUnit()}`;

    case 'SassColor':
      return serializeColor(sassValue);

    case 'SassNull':
      return `null`;

    case 'SassList':
      const listLength = sassValue.getLength();
      const listElement = [];
      const hasSeparator = sassValue.getSeparator();
      for(let i = 0; i < listLength; i++) {
        listElement.push(serialize(sassValue.getValue(i), true, sass));
      }
      // Make sure nested lists are serialized with surrounding parenthesis
      if(isInList) {
        return `(${listElement.join(hasSeparator ? ',' : ' ')})`;
      } else {
        return `${listElement.join(hasSeparator ? ',' : ' ')}`;
      }

    case 'SassMap':
      const mapLength = sassValue.getLength();
      const mapValue = {};
      for(let i = 0; i < mapLength; i++) {
        const key = serialize(sassValue.getKey(i), false, sass);
        const value = serialize(sassValue.getValue(i), false, sass);
        mapValue[key] = value;
      }
      const serializedMapValues = Object.keys(mapValue).map(key => `${key}: ${mapValue[key]}`);
      return `(${serializedMapValues})`;

    default:
      throw new Error(`Unsupported sass variable type '${type}'`)
  };
};

/**
 * Create a serialized string from a sassValue object
 */
export function serialize(sassValue, isInList, sass) {
  return serializeValue(sassValue, isInList, sass);
};
