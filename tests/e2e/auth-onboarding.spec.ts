import { expect, test } from "@playwright/test";

function uniqueUser() {
  const id = Date.now();
  return {
    displayName: "Ada Lovelace",
    username: `ada${id}`.slice(0, 20),
    email: `ada-${id}@example.local`,
    password: "SuperSecreta123",
  };
}

test("registro -> onboarding completo -> dashboard -> logout -> login", async ({
  page,
}) => {
  const user = uniqueUser();

  await page.goto("/register");
  await page.getByLabel("Nombre", { exact: true }).fill(user.displayName);
  await page.getByLabel("Nombre de usuario").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/onboarding/);

  // Paso 1: experiencia
  await page.getByText("Ninguna", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 2: objetivo
  await page.getByText("Frontend Developer", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // Paso 3: evaluación inicial — responde la primera opción de cada pregunta
  await expect(page.getByText("Evaluación inicial")).toBeVisible();
  const radios = page.locator('input[type="radio"]');
  // Las preguntas se cargan de forma asíncrona: espera a que las 8*4 opciones
  // estén realmente en el DOM antes de empezar a marcarlas.
  await expect(radios).toHaveCount(32);
  const count = await radios.count();
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    const name = await radios.nth(i).getAttribute("name");
    if (name && !seen.has(name)) {
      await radios.nth(i).check();
      seen.add(name);
    }
  }
  await page.getByRole("button", { name: "Generar mi roadmap" }).click();

  // Paso 4: roadmap
  await expect(page.getByText("Tu roadmap está listo")).toBeVisible();
  await expect(page.getByText(/\.\s*HTML$/)).toBeVisible();
  await page.getByRole("button", { name: "Ir a mi dashboard" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(user.displayName)).toBeVisible();
  await expect(page.getByText("Frontend Developer")).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);

  // Login de nuevo con las mismas credenciales debe volver directo al dashboard
  // (el onboarding ya está completado).
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("un usuario anónimo no puede acceder al dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
