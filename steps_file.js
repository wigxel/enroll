import { actor, secret } from "codeceptjs";
import { tryTo } from "codeceptjs/effects";

export default function () {
  return actor({
    async loginAsAdmin() {
      this.amOnPage("/sign-in");

      const isOnSignIn = await tryTo(() =>
        this.waitForElement("#identifier-field", 5),
      );

      if (!isOnSignIn) {
        return;
      }

      this.fillField("#identifier-field", process.env.ADMIN_EMAIL);
      this.waitForElement("#password-field", 10);
      this.fillField("#password-field", secret(process.env.ADMIN_PASSWORD));
      this.click("Continue");
      this.waitForInvisible(".cl-signIn-start", 20);
    },
  });
}
