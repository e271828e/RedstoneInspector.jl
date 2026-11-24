// The landing panel and the label in the window's title (workspace.md answer 10):
// the privacy statement and the help link before a drop, a refusal on the landing, the frame once a
// model loads, a structureless failure in the frame; Cmd-O and Ctrl-O picking a file
// wherever the page shows (increment 8b).
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, press, readyLevel, rows, shot, status } from "./fixtures";

const major2 = () => {
  const d = JSON.parse(fixtureText("descent"));
  d.format_version = { major: 2, minor: 0 };
  return JSON.stringify(d);
};

test("before a drop: the privacy statement, the open control, the help link, no canvas, no rows", async ({ page }) => {
  await page.goto("/");
  const landing = page.locator(".landing");
  await expect(landing).toHaveCount(1);
  await expect(landing.locator(".privacy")).toContainText("never uploaded");
  await expect(landing.locator(".privacy")).toContainText("The page loads nothing from any other site.");
  await expect(landing.locator(".privacy")).not.toContainText("network");
  await expect(landing.locator("button.open-file")).toHaveCount(1);
  await expect(landing.locator(".drop-hint")).toHaveCount(1);
  await expect(landing.locator('a.help[href="#help"]')).toHaveText("help");
  await expect(landing.locator("pre.outcome")).toHaveCount(0);
  await expect(page.locator("svg.canvas")).toHaveCount(0);
  await expect(rows(page)).toHaveCount(0);
  await expect(page).toHaveTitle("Redstone inspector");
  await shot(page, "none", "", "landing");
});

test("a major 2 copy of descent is refused on the landing, with no frame", async ({ page }) => {
  await drop(page, "descent", major2());
  await expect(page.locator(".landing pre.outcome")).toContainText("format 2.0");
  await expect(page.locator(".frame")).toHaveCount(0);
  await expect(page).toHaveTitle("Redstone inspector");
  await shot(page, "descent", "", "landing");
});

// deployment_overlay.md answer 2: a file an older core wrote, told by its structure
const OLDER = "an older Redstone wrote it. Write the file again with the current Redstone.";
test("a copy of descent without grid is refused on the landing, naming the key and the older Redstone", async ({ page }) => {
  const d = JSON.parse(fixtureText("descent"));
  delete d.build.structure.grid;
  await drop(page, "descent", JSON.stringify(d));
  await expect(page.locator(".landing pre.outcome")).toHaveText(`This build descriptor has no build.structure.grid: ${OLDER}`);
  await expect(page.locator(".frame")).toHaveCount(0);
});

test("a copy of timing_deployment without schedule is refused on the landing; one of failure_cycle without grid too", async ({ page }) => {
  const d = JSON.parse(fixtureText("timing_deployment"));
  delete d.deployment.schedule;
  await drop(page, "timing_deployment", JSON.stringify(d));
  await expect(page.locator(".landing pre.outcome")).toHaveText(`This deployment descriptor has no deployment.schedule: ${OLDER}`);
  const f = JSON.parse(fixtureText("failure_cycle"));
  delete f.failure.structure.grid;
  await drop(page, "failure_cycle", JSON.stringify(f));
  await expect(page.locator(".landing pre.outcome")).toHaveText(`This failure descriptor has no failure.structure.grid: ${OLDER}`);
});

test("closed_loop: the landing gives way to the frame and the title names the label", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(page.locator(".landing")).toHaveCount(0);
  await expect(page.locator(".frame")).toHaveCount(1);
  await expect(page).toHaveTitle("closed_loop – Redstone inspector");
});

test("the landing's open control picks a file", async ({ page }) => {
  await page.goto("/");
  await page.locator(".landing input[type=file]").setInputFiles({
    name: "closed_loop.json", mimeType: "application/json", buffer: Buffer.from(fixtureText("closed_loop")),
  });
  await page.locator(readyLevel("")).waitFor();
  await expect(page).toHaveTitle("closed_loop – Redstone inspector");
});

test("failure_structure: the frame, an empty tree, the sentence and the drawer on its diagnostics", async ({ page }) => {
  await drop(page, "failure_structure");
  await expect(page.locator(".frame")).toHaveCount(1);
  await expect(page.locator("nav.tree")).toHaveCount(1);
  await expect(rows(page)).toHaveCount(0);
  const crumb = page.locator("nav.breadcrumb");
  await expect(crumb.locator("a")).toHaveCount(0);
  await expect(crumb.locator(".current")).toHaveText("failure_structure");
  await expect(page.locator("pre.outcome")).toContainText("failure_structure");
  await expect(page.locator("pre.outcome")).toContainText("no structure to draw");
  await expect(page.locator("svg.canvas")).toHaveCount(0);
  const drawer = page.locator("section.drawer");
  await expect(drawer).toHaveAttribute("data-open", "true");
  await expect(drawer).toHaveAttribute("data-tab", "diagnostics");
  await expect(drawer.locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("2");
  await expect(status(page)).toHaveAttribute("data-kind", "failure");
  await expect(status(page)).toContainText("failure");
  await expect(page.locator("aside.detail h2 .segment")).toHaveText("failure_structure");
  await expect(page).toHaveTitle("failure_structure – Redstone inspector");
  await shot(page, "failure_structure", "", "landing");
});

/** The file chooser a key raises within a second, or none. */
async function chooserFrom(page: Page, key: string) {
  const chooser = page.waitForEvent("filechooser", { timeout: 1000 }).catch(() => undefined);
  await page.keyboard.press(key);
  return chooser;
}
const fileOf = (name: string) => ({ name: `${name}.json`, mimeType: "application/json", buffer: Buffer.from(fixtureText(name)) });

test("Cmd-O and Ctrl-O raise the file chooser on the landing, with a model, from the search field and under the help page, the picked file loading; with Shift or Alt they do not", async ({ page }) => {
  await page.goto("/");
  // a key pressed the moment the page loads raises no chooser in Playwright, whatever the page does
  await page.locator(".landing").waitFor();
  const pick = async (key: string, name: string, where: string) => {
    const chooser = await chooserFrom(page, key);
    expect(chooser, `${key} ${where}`).toBeDefined();
    await chooser!.setFiles(fileOf(name));
    await expect(page, `${key} ${where}`).toHaveTitle(`${name} – Redstone inspector`);
  };
  await pick("Meta+o", "closed_loop", "on the landing");
  await page.locator(readyLevel("")).waitFor();
  await pick("Control+o", "descent", "with a model");
  await page.locator("input.query").focus();
  await pick("Meta+o", "closed_loop", "from the search field");
  await expect(page.locator("input.query")).toBeFocused();
  await press(page, "Escape");
  await press(page, "?");
  await expect(page.locator("article.help")).toHaveCount(1);
  await pick("Control+o", "descent", "under the help page");
  await expect(page.locator("article.help")).toHaveCount(1);
  await press(page, "Escape");
  await expect(page.locator("article.help")).toHaveCount(0);
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator("nav.tree .row").first()).toHaveAttribute("data-path", "");
  for (const key of ["Meta+Shift+o", "Control+Shift+o", "Meta+Alt+o", "Control+Alt+o"]) {
    expect(await chooserFrom(page, key), key).toBeUndefined();
  }
});
