import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  return ['y', 'yes', 'true', '1'].includes(normalized);
}

function normalizeScenarioRecord(record) {
  return {
    name: String(record.name || record.scenario || '').trim(),
    runMode: String(record.runMode || 'Y').trim().toUpperCase(),
    openHome: parseBoolean(record.openHome, true),
    expectedTitleContains:
      record.expectedTitleContains === undefined || record.expectedTitleContains === null
        ? ''
        : String(record.expectedTitleContains),
    clickGetStarted: parseBoolean(record.clickGetStarted, false),
    expectedHeading:
      record.expectedHeading === undefined || record.expectedHeading === null
        ? ''
        : String(record.expectedHeading),
    expectedUrlContains:
      record.expectedUrlContains === undefined || record.expectedUrlContains === null
        ? ''
        : String(record.expectedUrlContains),
  };
}

function toScenarioList(records) {
  const scenarios = records
    .map(normalizeScenarioRecord)
    .filter((scenario) => scenario.name.length > 0);
  return { scenarios };
}

function loadJson(relativePathFromProjectRoot) {
  const fullPath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const parsed = JSON.parse(fileContent);
  if (!parsed.scenarios || !Array.isArray(parsed.scenarios)) {
    throw new Error(`Invalid JSON test data format in ${relativePathFromProjectRoot}. Expected { scenarios: [] }`);
  }
  return toScenarioList(parsed.scenarios);
}

function loadCsv(relativePathFromProjectRoot) {
  const fullPath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const rows = parse(fileContent, { columns: true, skip_empty_lines: true });
  return toScenarioList(rows);
}

function loadExcel(relativePathFromProjectRoot) {
  const fullPath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const workbook = xlsx.readFile(fullPath);
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(`No worksheets found in file: ${relativePathFromProjectRoot}`);
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  return toScenarioList(rows);
}

export function loadTestData(relativePathFromProjectRoot) {
  const extension = path.extname(relativePathFromProjectRoot).toLowerCase();

  if (extension === '.json') {
    return loadJson(relativePathFromProjectRoot);
  }

  if (extension === '.csv') {
    return loadCsv(relativePathFromProjectRoot);
  }

  if (extension === '.xlsx' || extension === '.xls') {
    return loadExcel(relativePathFromProjectRoot);
  }

  throw new Error(`Unsupported test data format: ${extension}. Use .json, .csv, .xlsx, or .xls`);
}

function loadJsonRows(relativePathFromProjectRoot) {
  const fullPath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const parsed = JSON.parse(fileContent);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.rows)) {
    return parsed.rows;
  }

  if (Array.isArray(parsed.scenarios)) {
    return parsed.scenarios;
  }

  throw new Error(
    `Invalid JSON table format in ${relativePathFromProjectRoot}. Expected [] or { rows: [] } or { scenarios: [] }`,
  );
}

function loadCsvRows(relativePathFromProjectRoot) {
  const fullPath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  return parse(fileContent, { columns: true, skip_empty_lines: true });
}

function loadExcelRows(relativePathFromProjectRoot, sheetName) {
  const fullPath = path.resolve(process.cwd(), relativePathFromProjectRoot);
  const workbook = xlsx.readFile(fullPath);
  const targetSheetName = sheetName || workbook.SheetNames[0];

  if (!targetSheetName || !workbook.Sheets[targetSheetName]) {
    throw new Error(
      `Worksheet '${sheetName}' not found in ${relativePathFromProjectRoot}. Available sheets: ${workbook.SheetNames.join(', ')}`,
    );
  }

  return xlsx.utils.sheet_to_json(workbook.Sheets[targetSheetName], { defval: '' });
}

export function loadTabularData(relativePathFromProjectRoot, { sheetName } = {}) {
  const extension = path.extname(relativePathFromProjectRoot).toLowerCase();

  if (extension === '.json') {
    return loadJsonRows(relativePathFromProjectRoot);
  }

  if (extension === '.csv') {
    return loadCsvRows(relativePathFromProjectRoot);
  }

  if (extension === '.xlsx' || extension === '.xls') {
    return loadExcelRows(relativePathFromProjectRoot, sheetName);
  }

  throw new Error(`Unsupported table data format: ${extension}. Use .json, .csv, .xlsx, or .xls`);
}
