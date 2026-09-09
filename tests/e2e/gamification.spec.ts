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

test("completar una lección muestra la celebración de logro y se refleja en Logros/Dashboard", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await expect(page.getByText(/Hola,|Llevas 1 día|racha/)).toBeVisible();

  await page.goto("/courses/html");
  await page.locator('a[href^="/lessons/"]').first().click();
  await expect(page).toHaveURL(/\/lessons\//);

  await page.getByRole("button", { name: "Marcar como completada" }).click();

  await expect(page.getByText("¡Logro desbloqueado!")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Genial" }).click();
  await expect(page.getByText("¡Logro desbloqueado!")).not.toBeVisible();

  await page.goto("/achievements");
  await expect(page.getByText("Primer paso")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByText("META DIARIA")).toBeVisible();
  await expect(page.getByText("Readiness Score")).toBeVisible();
});

test("la búsqueda global encuentra un curso real y navega a él", async ({ page }) => {
  await registerAndOnboard(page);

  await page.getByLabel("Búsqueda global").fill("HTML");
  const result = page.getByRole("button", { name: /HTML.*Curso/ }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/courses\/html/);
});
