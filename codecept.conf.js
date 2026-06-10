import { setCommonPlugins, setHeadlessWhen } from "@codeceptjs/configure";

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

/** @type {CodeceptJS.MainConfig} */
export const config = {
  tests: "./tests/*_test.js",
  output: "./output",
  helpers: {
    Playwright: {
      browser: "chromium",
      url: "http://localhost:3042",
      show: false,
    },
  },
  include: {
    I: "./steps_file.js",
  },
  noGlobals: true,
  plugins: {},
  name: "enroll",
};
