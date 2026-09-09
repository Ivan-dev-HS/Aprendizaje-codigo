import { expect, test } from "@playwright/test";

function uniqueUser() {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  return {
    displayName: "Ada Lovelace",
    username: `ada${id}`.slice(0, 20),
    email: `ada-${id}@example.local`,
    password: "SuperSecreta123",
  };
}

async function registerAndOnboard(page: import("@playwright/test").Page) {
  const user = uniqueUser();
  await page.goto("/register");
  await page.getByLabel("Nombre", { exact: true }).fill(user.displayName);
  await page.getByLabel("Nombre de usuario").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await page.getByText("Ninguna", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Frontend Developer", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  const radios = page.locator('input[type="radio"]');
  await expect(radios).toHaveCount(32);
  const seen = new Set<string>();
  const count = await radios.count();
  for (let i = 0; i < count; i++) {
    const name = await radios.nth(i).getAttribute("name");
    if (name && !seen.has(name)) {
      await radios.nth(i).check();
      seen.add(name);
    }
  }
  await page.getByRole("button", { name: "Generar mi roadmap" }).click();
  await expect(page.getByText("Tu roadmap está listo")).toBeVisible();
  await page.getByRole("button", { name: "Ir a mi dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("JS Lab ejecuta código real vía el exec-service y muestra la salida", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/labs/javascript");
  await expect(page.getByText("JavaScript Lab")).toBeVisible();
  await expect(page.locator(".monaco-editor")).toBeVisible();

  await page.getByRole("button", { name: "▶ Ejecutar" }).click();
  await expect(page.getByText("120")).toBeVisible({ timeout: 10_000 });
});

test("SQL Lab ejecuta un SELECT real contra el dataset sembrado", async ({ page }) => {
  await registerAndOnboard(page);

  await page.goto("/labs/sql");
  await expect(page.getByText("SQL Lab")).toBeVisible();
  await expect(page.getByText("Tienda online")).toBeVisible();

  await page.getByRole("button", { name: "▶ Ejecutar consulta" }).click();
  await expect(page.getByRole("columnheader", { name: "email" })).toBeVisible({
    timeout: 10_000,
  });
});

test("Terminal Lab ejecuta comandos reales sobre el sistema de archivos virtual", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/labs/terminal");
  await expect(page.getByText("Terminal Lab")).toBeVisible();

  const input = page.getByLabel("Comando de terminal");
  await input.fill("ls");
  await input.press("Enter");
  await expect(page.getByText("README.md")).toBeVisible();

  await input.fill("mkdir demo");
  await input.press("Enter");
  await input.fill("ls");
  await input.press("Enter");
  await expect(page.getByText("demo", { exact: true })).toBeVisible();

  await page.reload();
  const inputAfterReload = page.getByLabel("Comando de terminal");
  await inputAfterReload.fill("pwd");
  await inputAfterReload.press("Enter");
  await expect(page.getByText("/home/user").first()).toBeVisible();
});

test("Git Lab simula init -> add -> commit y lo refleja en el grafo", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/labs/git");
  await expect(page.getByText("Git Lab")).toBeVisible();

  const input = page.getByLabel("Comando git");
  await input.fill("git init");
  await input.press("Enter");
  await input.fill("git add index.html");
  await input.press("Enter");
  await input.fill('git commit -m "primer commit"');
  await input.press("Enter");

  await expect(page.getByText("primer commit").first()).toBeVisible();
  await expect(page.getByText("main", { exact: false }).first()).toBeVisible();
});

test("Playground renderiza HTML/CSS/JS en un iframe aislado", async ({ page }) => {
  await registerAndOnboard(page);

  await page.goto("/labs/playground");
  await expect(page.getByText("Playground HTML / CSS / JS")).toBeVisible();

  const frame = page.frameLocator('iframe[title="Vista previa"]');
  await expect(frame.getByRole("heading", { name: "Hola, CodeForge" })).toBeVisible({
    timeout: 10_000,
  });
});
