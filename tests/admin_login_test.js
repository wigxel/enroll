import { locate } from "codeceptjs";

Feature("admin");

Before(({ login }) => {
  login("admin");
});

Scenario("admin can log in and create a review", ({ I }) => {
  I.amOnPage("/admin/dashboard");
  I.waitForElement("h1", 10);
  I.click("Reviews");
  I.waitForElement("h1", 10);
  I.see("Reviews");
  I.click("Add Review");
  I.waitForElement('[role="dialog"]', 5);

  I.click(locate("button[role='combobox']").first());
  I.waitForElement('input[placeholder="Search students..."]', 3);
  I.waitForText("@", 5);
  I.click(locate("button").withText("@"));
  I.click(locate("button").withClass("focus:outline-none").at(5));
  I.fillField(
    "#review-text",
    "Excellent student, showed great dedication and skill improvement throughout the program.",
  );
  I.click("Create Review");
  I.waitForInvisible('[role="dialog"]', 10);
  I.see("Reviews");
});
