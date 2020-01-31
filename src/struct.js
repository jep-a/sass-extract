import { toColorHex } from './util';
import { serialize } from './serialize';

/**
 * Transform a sassValue into a structured value based on the value type
 */
function makeValue(sassValue, sass) {
  const type = sassValue.constructor.name;

  switch(type) {
    case 'SassString':
    case 'SassBoolean':
      return { type, value: sassValue.getValue() };

    case 'SassNumber':
      return { type, value: sassValue.getValue(), unit: sassValue.getUnit() };

    case 'SassColor':
      const r = Math.round(sassValue.getR());
      const g = Math.round(sassValue.getG());
      const b = Math.round(sassValue.getB());

      return {
        type,
        value: {
          r, g, b,
          a: sassValue.getA(),
          hex: `#${toColorHex(r)}${toColorHex(g)}${toColorHex(b)}`
        },
      };

    case 'SassNull':
      return { type, value: null };

    case 'SassList':
      const listLength = sassValue.getLength();
      const listValue = [];
      for(let i = 0; i < listLength; i++) {
        listValue.push(createStructuredValue(sassValue.getValue(i), sass));
      }
      return { type, value: listValue, separator: sassValue.getSeparator() ? ',' : ' ' };

    case 'SassMap':
      const mapLength = sassValue.getLength();
      const mapValue = {};
      for(let i = 0; i < mapLength; i++) {
        // Serialize map keys of arbitrary type for extracted struct
        const serializedKey = serialize(sassValue.getKey(i), false, sass);
        mapValue[serializedKey] = createStructuredValue(sassValue.getValue(i), sass);
      }
      return { type, value: mapValue };

    default:
      throw new Error(`Unsupported sass variable type '${type}'`)
  };
};

/**
 * Create a structured value definition from a sassValue object
 */
export function createStructuredValue(sassValue, sass) {
  return makeValue(sassValue, sass);
};
