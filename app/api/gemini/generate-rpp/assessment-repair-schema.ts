import { object, objectArray, summativeItem } from './schema-common';

export const ASSESSMENT_REPAIR_SCHEMA = object({
  questions: objectArray(summativeItem),
}, ['questions']);
