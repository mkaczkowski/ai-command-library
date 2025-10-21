import { log } from './logger.js';
import { readJsonFile } from './fileSystem.js';

const DEFAULT_ARRAY_KEYS = ['comments', 'entries'];

export async function loadJsonArray(filePath, { label = 'entries', arrayProperty } = {}) {
  log('INFO', `Reading JSON file: ${filePath}`);
  const data = await readJsonFile(filePath);

  let entries = Array.isArray(data) ? data : undefined;

  if (!entries && arrayProperty && Array.isArray(data?.[arrayProperty])) {
    entries = data[arrayProperty];
  }

  if (!entries) {
    for (const key of DEFAULT_ARRAY_KEYS) {
      if (Array.isArray(data?.[key])) {
        log('INFO', `Detected "${key}" array in JSON; using it as ${label}.`);
        entries = data[key];
        break;
      }
    }
  }

  if (!entries) {
    throw new Error('Input JSON must be an array or contain a supported array property.');
  }

  if (!Array.isArray(entries)) {
    throw new Error('Resolved JSON entries value is not an array.');
  }

  log('DEBUG', `Loaded ${entries.length} ${label} from JSON`);
  return entries;
}

export function requireObject(entry, index, { label = 'Entry' } = {}) {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new Error(`${buildEntryPrefix(label, index)} must be an object.`);
  }
  return entry;
}

export function requireStringField(
  entry,
  fieldName,
  index,
  { label = 'Entry', allowEmpty = false, trimResult = false } = {}
) {
  const value = entry?.[fieldName];

  if (typeof value !== 'string') {
    throw new Error(`${buildEntryPrefix(label, index)}: "${fieldName}" must be a string.`);
  }

  const trimmed = value.trim();
  if (!allowEmpty && trimmed === '') {
    throw new Error(`${buildEntryPrefix(label, index)}: "${fieldName}" cannot be empty.`);
  }

  return trimResult ? trimmed : value;
}

export function requireNonEmptyStringField(entry, fieldName, index, options = {}) {
  return requireStringField(entry, fieldName, index, { ...options, allowEmpty: false });
}

export function requireNumericStringField(entry, fieldName, index, { label = 'Entry' } = {}) {
  const value = requireStringField(entry, fieldName, index, {
    label,
    allowEmpty: false,
    trimResult: true,
  });

  if (!/^\d+$/.test(value)) {
    throw new Error(`${buildEntryPrefix(label, index)}: "${fieldName}" must be numeric.`);
  }

  return value;
}

export function requireUrlField(entry, fieldName, index, { label = 'Entry' } = {}) {
  const value = requireStringField(entry, fieldName, index, {
    label,
    allowEmpty: false,
    trimResult: true,
  });

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('URL must use http or https.');
    }
  } catch (error) {
    throw new Error(`${buildEntryPrefix(label, index)}: "${fieldName}" must be a valid HTTP(S) URL.`);
  }

  return value;
}

export function requireOptionalPositiveIntegerField(entry, fieldName, index, { label = 'Entry' } = {}) {
  const value = entry?.[fieldName];

  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(`${buildEntryPrefix(label, index)}: "${fieldName}" must be a positive integer.`);
  }

  return numericValue;
}

function buildEntryPrefix(label, index) {
  if (typeof index === 'number' && Number.isInteger(index)) {
    return `${label} ${index + 1}`;
  }

  return label;
}
