import { expect, test } from "@playwright/test";

function uniqueUser() {
  const id = Date.now();
  return {
    displayName: "Katherine Johnson",
    username: `kat${id}`.slice(0, 20),
    email: `kat-${id}@example.local`,
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

test("resolver un ejercicio MCQ otorga XP y se refleja como completado en el listado", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/exercises");
  await page.getByRole("combobox").first().selectOption({ label: "Git" });

  // Selecciona el ejercicio MCQ de git (único con ese tipo en el catálogo).
  await page.getByText("El comando para mover a staging").click();
  await expect(page).toHaveURL(/\/exercises\//);

  await page.getByText("git add", { exact: true }).click();
  await page.getByRole("button", { name: "Enviar respuesta" }).click();

  await expect(page.getByText(/¡Correcto!/)).toBeVisible();
  await expect(page.getByText(/\+10 XP/)).toBeVisible();

  await page.goto("/exercises");
  await page.getByRole("combobox").first().selectOption({ label: "Git" });
  await expect(page.getByTitle("Completado")).toBeVisible();
});

test("pedir una pista la muestra sin revelar la solución completa", async ({ page }) => {
  await registerAndOnboard(page);

  await page.goto("/exercises");
  await page.getByRole("combobox").first().selectOption({ label: "Git" });
  await page.getByText("El comando para mover a staging").click();

  await page.getByRole("button", { name: /Pedir pista/ }).click();
  await expect(page.getByText(/Pista 1:/)).toBeVisible();
});
