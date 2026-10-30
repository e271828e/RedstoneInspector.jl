// The header check through the drop (workspace.md answer 10): another major is
// refused in words, a newer minor loads with its note.
import { test } from "@playwright/test";
import { drop, expect, fixtureText, readyLevel, shot } from "./fixtures";

const withVersion = (major: number, minor: number) => {
  const d = JSON.parse(fixtureText("descent"));
  d.format_version = { major, minor };
  return JSON.stringify(d);
};

test("a major 2 copy of descent is refused in a sentence naming 2 and 1", async ({ page }) => {
  await drop(page, "descent", withVersion(2, 0));
  const outcome = page.locator("pre.outcome");
  await expect(outcome).toContainText("format 2.0");
  await expect(outcome).toContainText("format 1.0");
  await expect(page.locator("svg.canvas")).toHaveCount(0);
  await shot(page, "descent", "", "major2");
});

test("a minor 1 copy of descent loads with the note shown and the canvas drawn", async ({ page }) => {
  await drop(page, "descent", withVersion(1, 1));
  await expect(page.locator("footer.status .note")).toContainText("format 1.1");
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  await expect(page.locator("g.block")).toHaveCount(5);
  await shot(page, "descent", "", "minor1");
});
