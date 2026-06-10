Feature("account");

Scenario("test something", ({ I }) => {
  I.amOnPage("/");
  I.see("Programs");
  I.click("Programs");
  I.waitToSee("Available Programs");
});
