import {readFile} from 'fs/promises';
import {log} from './logger.js';
import {ENHANCE_COMMENT_CSV_CONFIG} from './config.js';

/**
 * CSV parsing helpers tailored to the GitHub comment workflows.
 */

/**
 * Parse CSV content, handling quoted fields, embedded newlines and commas.
 * @param {string} content - Raw CSV content
 * @returns {{headers: string[], rows: string[][]}} Parsed CSV data
 */
function parseCSVContent(content) {
    const {QUOTE, COMMA, NEWLINE, CARRIAGE_RETURN} = ENHANCE_COMMENT_CSV_CONFIG.CHARS;

    const parser = {
        rows: [],
        currentRow: [],
        currentField: '',
        inQuotes: false,
        position: 0,

        isAtEnd() {
            return this.position >= content.length;
        },

        currentChar() {
            return content[this.position];
        },

        nextChar() {
            return content[this.position + 1];
        },

        advance(steps = 1) {
            this.position += steps;
        },

        handleQuote() {
            if (this.inQuotes && this.nextChar() === QUOTE) {
                this.currentField += QUOTE;
                this.advance(2);
            } else {
                this.inQuotes = !this.inQuotes;
                this.advance();
            }
        },

        handleComma() {
            this.currentRow.push(this.currentField);
            this.currentField = '';
            this.advance();
        },

        handleNewline() {
            this.currentRow.push(this.currentField);
            if (this.currentRow.length > 0 && this.currentRow.some((field) => field.trim())) {
                this.rows.push(this.currentRow);
            }
            this.currentRow = [];
            this.currentField = '';

            // Handle \r\n
            if (this.currentChar() === CARRIAGE_RETURN && this.nextChar() === NEWLINE) {
                this.advance(2);
            } else {
                this.advance();
            }
        },

        handleRegularChar() {
            this.currentField += this.currentChar();
            this.advance();
        },

        finalize() {
            if (this.currentField || this.currentRow.length > 0) {
                this.currentRow.push(this.currentField);
                if (this.currentRow.some((field) => field.trim())) {
                    this.rows.push(this.currentRow);
                }
            }

            if (this.rows.length === 0) {
                throw new Error('CSV file is empty or contains no valid data');
            }

            const headers = this.rows[0];
            const dataRows = this.rows.slice(1);

            return {headers, rows: dataRows};
        },
    };

    while (!parser.isAtEnd()) {
        const char = parser.currentChar();

        if (char === QUOTE) {
            parser.handleQuote();
        } else if (char === COMMA && !parser.inQuotes) {
            parser.handleComma();
        } else if ((char === NEWLINE || char === CARRIAGE_RETURN) && !parser.inQuotes) {
            parser.handleNewline();
        } else {
            parser.handleRegularChar();
        }
    }

    return parser.finalize();
}

/**
 * Validate CSV headers against the expected format.
 * @param {string[]} headers - CSV header row
 * @param {string[]} requiredHeaders - Expected header names
 * @param {number} expectedColumns - Expected number of columns
 */
function validateCSVHeaders(headers, requiredHeaders, expectedColumns) {
    if (headers.length !== expectedColumns) {
        throw new Error(`CSV header must have exactly ${expectedColumns} columns`);
    }

    for (let i = 0; i < requiredHeaders.length; i++) {
        if (headers[i] !== requiredHeaders[i]) {
            throw new Error(`CSV header must be exactly: ${requiredHeaders.join(',')}`);
        }
    }
}

/**
 * Generic CSV row validator.
 * @param {string[]} row - CSV row data
 * @param {number} rowNumber - Row number for error reporting
 * @param {number} expectedColumns - Expected number of columns
 * @param {Function[]} [fieldValidators] - Optional array of field validator functions
 * @returns {Object} Validated row data
 */
function validateCSVRow(row, rowNumber, expectedColumns, fieldValidators = []) {
    if (row.length !== expectedColumns) {
        throw new Error(`Row ${rowNumber}: Expected ${expectedColumns} columns, got ${row.length}`);
    }

    const validatedRow = {};

    row.forEach((field, index) => {
        if (fieldValidators[index]) {
            const result = fieldValidators[index](field, rowNumber, index);
            if (result.isValid) {
                validatedRow[result.fieldName] = result.value;
            } else {
                throw new Error(`Row ${rowNumber}: ${result.error}`);
            }
        } else {
            validatedRow[`field${index}`] = field;
        }
    });

    return validatedRow;
}

/**
 * Read and parse CSV file with validation.
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - Parsing options
 * @param {string[]} options.requiredHeaders - Expected header names
 * @param {number} options.expectedColumns - Expected number of columns
 * @param {Function[]} [options.fieldValidators] - Field validator functions
 * @param {Function} [options.rowProcessor] - Optional row processing function
 * @returns {Promise<{headers: string[], rows: Object[]}>} Parsed and validated CSV data
 */
async function parseCSVFile(filePath, options) {
    const {requiredHeaders, expectedColumns, fieldValidators, rowProcessor} = options;

    log('INFO', `Reading CSV file: ${filePath}`);

    const content = await readFile(filePath, 'utf8');
    log('DEBUG', `File size: ${content.length} characters`);

    const {headers, rows} = parseCSVContent(content);

    validateCSVHeaders(headers, requiredHeaders, expectedColumns);

    const processedRows = [];
    for (let i = 0; i < rows.length; i++) {
        const rowNumber = i + 2; // +2 because of header and 1-based indexing
        let validatedRow = validateCSVRow(rows[i], rowNumber, expectedColumns, fieldValidators);

        if (rowProcessor) {
            validatedRow = await rowProcessor(validatedRow, rowNumber);
        }

        log('DEBUG', `Processing row ${rowNumber}`, {rowData: validatedRow});
        processedRows.push(validatedRow);
    }

    if (processedRows.length === 0) {
        throw new Error('No valid rows found in CSV file');
    }

    log('INFO', `Loaded ${processedRows.length} rows from CSV`);
    return {headers, rows: processedRows};
}

/**
 * Create field validator for comment ID.
 * @param {string} fieldName - Name of the field
 * @returns {Function} Validator function
 */
function createIdFieldValidator(fieldName = 'id') {
    return (value) => {
        const trimmedValue = String(value).trim();
        if (!trimmedValue) {
            return {
                isValid: false,
                error: `Comment ID cannot be empty`,
            };
        }
        return {
            isValid: true,
            fieldName,
            value: trimmedValue,
        };
    };
}

/**
 * Create field validator for string fields.
 * @param {string} fieldName - Name of the field
 * @param {boolean} [allowEmpty=false] - Whether empty strings are allowed
 * @returns {Function} Validator function
 */
function createStringFieldValidator(fieldName, allowEmpty = false) {
    return (value) => {
        if (typeof value !== 'string') {
            return {
                isValid: false,
                error: `${fieldName} must be a string`,
            };
        }
        if (!allowEmpty && !value.trim()) {
            return {
                isValid: false,
                error: `${fieldName} cannot be empty`,
            };
        }
        return {
            isValid: true,
            fieldName,
            value,
        };
    };
}

/**
 * Create field validator for optional positive integers.
 * @param {string} fieldName
 * @returns {Function}
 */
function createOptionalPositiveIntegerFieldValidator(fieldName) {
    return (value) => {
        if (value === undefined) {
            return {
                isValid: true,
                fieldName,
                value: undefined,
            };
        }

        const trimmedValue = String(value).trim();
        if (!trimmedValue) {
            return {
                isValid: true,
                fieldName,
                value: undefined,
            };
        }

        const numericValue = Number(trimmedValue);
        if (!Number.isInteger(numericValue) || numericValue <= 0) {
            return {
                isValid: false,
                error: `${fieldName} must be a positive integer`,
            };
        }

        return {
            isValid: true,
            fieldName,
            value: numericValue,
        };
    };
}

export {
    parseCSVContent,
    validateCSVHeaders,
    validateCSVRow,
    parseCSVFile,
    createIdFieldValidator,
    createStringFieldValidator,
    createOptionalPositiveIntegerFieldValidator,
};
