import { CodeUpdater } from "../../src/code/CodeUpdater";
import { FileModel } from "../../src/code/FileModel";
import { WindowEvent } from "../../src/types";
import {
  FixturesServer,
  launch,
  LaunchResult,
  serveFixtures,
  sleep,
} from "../utils";

const testModel = new FileModel();
let launched: LaunchResult;
let server: FixturesServer;
let updater: CodeUpdater;

beforeAll(async () => {
  launched = await launch();
  server = await serveFixtures();

  updater = new CodeUpdater({ testModel, variables: { page: launched.page } });
  updater.setContext(launched.context);

  await updater.enable();

  await launched.page.goto(`${server.url}/CodeUpdater`);
});

beforeEach(() => {
  testModel._content.delete(0, testModel.content.length);
  testModel._content.insert(0, "// 🐺 QA Wolf will create code here");
});

afterAll(async () => {
  server.close();
  await launched.browser.close();
});

it("ignores events triggered before enabled", async () => {
  updater.disable();
  await updater.enable();

  const reloadEvent: WindowEvent = {
    action: "reload",
    page: launched.page,
    time: Date.now(),
  };

  expect(updater._handleEvent({ ...reloadEvent, time: 1 })).toBe(false);
  expect(updater._handleEvent(reloadEvent)).toBe(true);
});

it("updates code for a click", async () => {
  await launched.page.click("button");

  // let events propagate
  await sleep(0);

  // we do not expect the code to create the page
  // since we enabled the updater after those steps
  expect(testModel._content.toJSON()).toMatchInlineSnapshot(`
    "await page.click(\\"text=Hello\\");
    // 🐺 QA Wolf will create code here"
  `);
});

it("updates code for a fill inside a frame", async () => {
  const frame = await (
    await launched.page.waitForSelector('[data-qa="frame"]')
  ).contentFrame();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await frame!.fill("input", "hello");

  // let events propagate
  await sleep(1000);

  // we do not expect the code to create the page
  // since we enabled the updater after those steps
  expect(testModel._content.toJSON()).toMatchInlineSnapshot(`
    "const frame = await (await page.waitForSelector('[data-qa=\\"frame\\"]')).contentFrame();
    await frame.fill('[type=\\"text\\"]', \\"hello\\");
    // 🐺 QA Wolf will create code here"
  `);
});
