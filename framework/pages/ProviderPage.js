import { expect } from '@playwright/test';
import { waitForToastToDisappear } from '../utils/commonUtils.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class ProviderPage {
  constructor(page) {
    this.page = page;

    // Navigation buttons
    this.settingButton = page.getByText("Settings", { exact: true });
    this.dbTablesButton = page.getByText("Database Tables", { exact: true });
    this.providerScreen = page.getByText("Providers", { exact: true });

    // Provider form elements
    this.addProviderButton = page.locator("button.plusbtn").last();
    this.searchProviderInput = page.getByPlaceholder("Search by Provider Name");
    this.noResultsMessage = page.getByText("No Data to Display");
    this.providerResults = page.locator("li.col-12.col-md-6.col-lg-3:visible");
    this.editOptionButton = page.getByTitle("Edit");
    this.saveToast = page.getByText("Successfully added", { exact: true });
    this.updateToast = page.getByText("Successfully updated", { exact: true });

    //Add/Edit Provider form elements
    this.officeNameInput = page.getByLabel("Office Name");
    this.providerFirstNameInput = page.getByLabel("Provider First");
    this.providerLastNameInput = page.getByLabel("Provider Last");
    this.PINDetailsSection = page.getByText("PIN Details");
    this.PINDropDown = page.locator(
      "//div[@class='pin-col-type']//div[@aria-label='dropdownlist']",
    );
    this.ETINPIN = page.getByText("Employer TIN");
    //this.ETINPINInput = page.getByLabel("PIN");
    this.ETINPINInput = page.getByRole("textbox", { name: "PIN" });
    this.address = page.getByLabel("Address");
    this.city = page.getByLabel("City");
    this.state = page.getByLabel("State");
    this.zip = page.getByLabel("Zip");
    this.addButton = page.getByRole("button", { name: "Save" });

  }

  // Navigate to the Settings Menu
  async navigateToSettings() {
    await this.settingButton.click();
  }

  // Navigate to the Database Tables section
  async navigateDBTables() {
    await this.dbTablesButton.hover();
  }

  // Navigate to the Providers Screen
  async navigateToProvider() {
    await this.page.getByText("Provider").click();
  }

  // Fill the provider form with the given data
  async fillProviderForm(providerData = {}) {
    const firstName = String(providerData.firstName || "").trim();
    const lastName = String(providerData.lastName || "").trim();
    const officeName = String(providerData.officeName || "").trim();

    if (!firstName || !lastName || !officeName) {
      throw new Error(
        "Provider data is incomplete. Required: officeName, firstName, lastName",
      );
    }

    await this.officeNameInput.fill(officeName);
    await this.providerFirstNameInput.fill(firstName);
    await this.providerLastNameInput.fill(lastName);
  }

  // Test - "Add a provider" using the provided data//
  async addProviderFromData(providerData) {
    await this.navigateToSettings();
    await this.navigateDBTables();
    await this.navigateToProvider();
    await this.addProviderButton.click();
    await this.fillProviderForm(providerData);
    await this.addButton.click();
    await waitForToastToDisappear(this.saveToast);
  }




  //Test - "Edit a provider" using the provided data//
  async editProviderFromData({ currentFirstName, currentLastName, ETINPIN, address, city, state, zip }) {
    const lastName = String(currentLastName || "").trim();
    const etinPinValue = String(ETINPIN || "").trim();
    const firstName = String(currentFirstName || "").trim();
    const fullProviderName = `${firstName} ${lastName}`.trim();
    const addressValue = String(address || "").trim();
    const cityvalue = String(city || "").trim();
    const statevalue = String(state || "").trim();
    const zipvalue = String(zip || "").trim();


    if (!lastName || !firstName || !etinPinValue || !addressValue || !cityvalue || !statevalue || !zipvalue) {
      throw new Error(
        "Provider edit data is incomplete. Required: currentFirstName, currentLastName, ETINPIN, address, city, state, zip",
      );
    }

    await this.navigateToSettings();
    await this.navigateDBTables();
    await this.navigateToProvider();
    await this.searchProviderByName(lastName);
    await this.editMatchedCard(fullProviderName);
    await this.insertETINPIN(etinPinValue);
    await this.insertAddress(addressValue, cityvalue, statevalue, zipvalue);
    await this.addButton.click();
    await waitForToastToDisappear(this.updateToast);
  }

  //Search for a provider by name to edit
  async searchProviderByName(providerName) {
    await this.searchProviderInput.fill(providerName);
    await this.searchProviderInput.press("Enter");
    try{
          await expect
      .poll(async () => await this.providerResults.count(), { timeout: 10000 })
      .toBeGreaterThan(0);
    } catch (error) {
      throw new Error(`Provider with name "${providerName}" not found within timeout.`);
    }
  }

  // Edit the matched provider card
  async editMatchedCard(fullProviderName) {
    const fullNamePattern = new RegExp(`^${escapeRegex(fullProviderName)}(?:\\s|$)`, "i");
    const matchingProviderCards = this.providerResults.filter({
      has: this.page.getByRole("heading", { level: 3, name: fullNamePattern }),
    });
    const matchCount = await matchingProviderCards.count();
    if (matchCount !== 1) {
      throw new Error(
        `Expected exactly one provider card with full name "${fullProviderName}", but found ${matchCount}.`,
      );
    }
    const targetProviderCard = matchingProviderCards.first();
    await expect(targetProviderCard).toBeVisible();

    const dropdownButton = targetProviderCard
      .locator(
        '[title="dropdown"], [aria-label*="dropdown" i], .dropdown-toggle, button:has-text("⋮")',
      )
      .first();
    if (await dropdownButton.count()) {
      await dropdownButton.click();
    }

    const cardEditOption = targetProviderCard
      .locator(
        '[title="Edit"], [aria-label*="Edit" i], button:has-text("Edit"), a:has-text("Edit")',
      )
      .first();
    if (await cardEditOption.count()) {
      await expect(cardEditOption).toBeVisible();
      await cardEditOption.click();
      return;
    }

    const editOption = this.page
      .locator(
        '[title="Edit"], [aria-label*="Edit" i], button:has-text("Edit"), a:has-text("Edit")',
      )
      .first();
    await expect(editOption).toBeVisible();
    await editOption.click();
  }

  async insertETINPIN(etinPinValue) {
    await this.PINDetailsSection.click();

    await this.PINDropDown.click();
    await this.ETINPIN.click();

    const pinValue = String(etinPinValue);
    await this.ETINPINInput.click();
    await this.ETINPINInput.fill("");
    await this.ETINPINInput.pressSequentially(pinValue);
    await expect(this.ETINPINInput).toHaveValue(pinValue);
  }

  async insertAddress(address, city, state, zip) {
    await this.address.fill(address);
    await this.city.fill(city);
    await this.state.fill(state);
    await this.zip.fill(zip);
  }
}
