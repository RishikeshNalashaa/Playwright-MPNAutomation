import { test } from '../../framework/fixtures/baseFixture.js';
import { loadTabularData } from '../../framework/utils/testDataUtils.js';
import { getRunnableRows } from '../../framework/utils/commonUtils.js';

const providerDataFile = process.env.PROVIDER_DATA_FILE || './framework/data/SyntheticTestData.xlsx';
const providerDataSheet = process.env.PROVIDER_DATA_SHEET || 'Provider';
const providerRows = getRunnableRows(loadTabularData(providerDataFile, { sheetName: providerDataSheet }));

test.describe('DataBase Tables', () => {
  test.describe.configure({ mode: 'serial' });

  for (const [index, row] of providerRows.entries()) {
    const addTestName = row.testName || row.name || `Add provider row ${index + 1}`;
    const editTestName = `${addTestName} - Edit provider`;

    test("Add Providers", async ({ providerPage }) => {
      //await providerPage.verifyHeadingVisible();
      await providerPage.addProviderFromData({
        officeName: row.officeName,
        firstName: row.firstName,
        lastName: row.lastName,
      });
    });
    
    test("Edit Providers", async ({ providerPage }) => {
      //await providerPage.verifyHeadingVisible();
      await providerPage.editProviderFromData({
        currentFirstName: row.firstName,
        currentLastName: row.lastName,
        ETINPIN: row.ETINPIN,
        address: row.Address,
        city: row.City,
        state: row.State,
        zip: row.ZIP,
      });
    });
    
  }
});
  