# Playwright MPNAutomation - POM + Data-Driven

This project follows a **POM + Data-Driven** architecture.

## Folder Structure

```text
Playwright MPNAutomation/
│
├── framework/
│   │
│   ├── data/
│   │   ├── loginData.json
│   │   └── facilityData.json
│   │
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── HomePage.js
│   │   ├── FacilityPage.js
│   │   └── PatientPage.js
│   │
│   ├── utils/
│   │   ├── commonUtils.js
│   │   ├── testDataUtils.js
│   │   └── apiUtils.js
│   │
│   └── fixtures/
│       └── baseFixture.js
│
├── tests/
│   ├── login/
│   │   └── login.spec.js
│   │
│   ├── facility/
│   │   └── facility.spec.js
│   │
│   └── patient/
│       └── patient.spec.js
│
├── test-results/
├── playwright-report/
│
├── .env.qa
├── .env.uat
├── .env.prod
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.js
└── README.md
```

## Run Tests

```bash
npm test
```

## Profile-specific Runs

```bash
npm run test:qa
npm run test:uat
npm run test:prod
```

## Env Variables

Each `.env` profile sets:

- `BASE_URL`
- `LOGIN_USERNAME`
- `LOGIN_PASSWORD`
- `LOGIN_DATA_FILE`
- `FACILITY_DATA_FILE`
- `PROVIDER_DATA_FILE`
- `PROVIDER_DATA_SHEET`

## Excel-driven Provider Data

- File: `framework/data/SyntheticTestData.xlsx`
- Sheet: `Provider`
- Required columns:
  - `runMode` (`Y`/`N`)
  - `testName`
  - `officeName`
  - `firstName`
  - `lastName`

This pattern is reusable for your other 13 pages:
1. Add one sheet per page in the same workbook (or separate workbook per page).
2. Read rows using `loadTabularData(..., { sheetName })`.
3. Filter with `getRunnableRows(...)`.
4. Pass each row object to that page's `add...FromData(...)` method.
