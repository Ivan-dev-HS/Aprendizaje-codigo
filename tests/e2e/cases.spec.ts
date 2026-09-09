import { expect, test } from "@playwright/test";

function uniqueUser() {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  return {
    displayName: "Margaret Hamilton",
    username: `margaret${id}`.slice(0, 20),
    email: `margaret-${id}@example.local`,
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

test("filtrar por Debugging y resolver un caso de Git otorga XP", async ({ page }) => {
  await registerAndOnboard(page);

  await page.goto("/cases");
  await expect(page.getByRole("heading", { name: "Casos reales" })).toBeVisible();
  await page.getByRole("button", { name: "Debugging" }).click();

  await page.getByText("El equipo no ve mis cambios después de hacer push").click();
  await expect(page).toHaveURL(/\/cases\//);
  await expect(page.getByText("SÍNTOMAS")).toBeVisible();

  await page
    .getByText(
      "Los cambios están confirmados en feature/login, pero nadie ha hecho merge",
    )
    .click();
  await page.getByRole("button", { name: "Enviar diagnóstico" }).click();

  await expect(page.getByText(/¡Diagnóstico correcto!/)).toBeVisible();
  await expect(page.getByText(/\+15 XP/)).toBeVisible();
});

test("un caso de producción exige rellenar el postmortem antes de poder enviar", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/cases");
  await page.getByRole("button", { name: "Producción" }).click();
  await page.getByText("Funciona en local pero no en producción").click();

  await expect(page.getByText("Postmortem")).toBeVisible();
  const submitButton = page.getByRole("button", { name: "Enviar diagnóstico" });
  await expect(submitButton).toBeDisabled();

  await page
    .getByText("La variable de entorno DATABASE_URL no se configuró en producción")
    .click();
  await expect(submitButton).toBeDisabled();

  await page
    .getByLabel("Causa raíz")
    .fill("Faltaba configurar DATABASE_URL en producción.");
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(
    page.getByText(/¡Diagnóstico correcto!|No es el diagnóstico correcto/),
  ).toBeVisible();
});
