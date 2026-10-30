// The landing panel and the label in the window's title (workspace.md answer 10):
// the privacy statement before a drop, a refusal on the landing, the frame once a
// model loads, a structureless failure in the frame.
import { test } from "@playwright/test";
import { drop, expect, fixtureText, readyLevel, rows, shot, status } from "./fixtures";

const major2 = () => {
  const d = JSON.parse(fixtureText("descent"));
  d.format_version = { major: 2, minor: 0 };
  return JSON.stringify(d);
};

test("before a drop: the privacy statement, the open control, no canvas, no rows", async ({ page }) => {
  await page.goto("/");
  const landing = page.locator(".landing");
  await expect(landing).toHaveCount(1);
  await expect(landing.locator(".privacy")).toContainText("never uploaded");
  await expect(landing.locator(".privacy")).toContainText("nothing from the network");
  await expect(landing.locator("button.open-file")).toHaveCount(1);
  await expect(landing.locator(".drop-hint")).toHaveCount(1);
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
