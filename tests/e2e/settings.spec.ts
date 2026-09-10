import { expect, test } from "@playwright/test";

function uniqueUser() {
  const id = Date.now();
  return {
    displayName: "Grace Hopper",
    username: `grace${id}`.slice(0, 20),
    email: `grace-${id}@example.local`,
    password: "SuperSecreta123",
  };
}

async function registerAndSkipOnboarding(
  page: import("@playwright/test").Page,
  user: ReturnType<typeof uniqueUser>,
) {
  await page.goto("/register");
  await page.getByLabel("Nombre", { exact: true }).fill(user.displayName);
  await page.getByLabel("Nombre de usuario").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByText("Ninguna", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Frontend Developer", { exact: true }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  const radios = page.locator('input[type="radio"]');
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
  await expect(page.getByText("Tu roadmap está listo")).toBeVisible();
  await page.getByRole("button", { name: "Ir a mi dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("un usuario puede editar su perfil y borrar su cuenta desde Ajustes", async ({
  page,
}) => {
  const user = uniqueUser();
  await registerAndSkipOnboarding(page, user);

  await page.getByRole("link", { name: "Ajustes" }).click();
  await expect(page).toHaveURL(/\/settings/);

  // Editar perfil.
  const newBio = `Bio actualizada ${Date.now()}`;
  await page.getByLabel("Bio").fill(newBio);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Cambios guardados.")).toBeVisible();

  // Zona de peligro: rechaza la contraseña incorrecta primero.
  await page.getByRole("button", { name: "Borrar mi cuenta" }).click();
  await page
    .getByLabel("Introduce tu contraseña para confirmar")
    .fill("ContraseñaIncorrecta");
  await page
    .getByRole("button", { name: "Sí, borrar mi cuenta definitivamente" })
    .click();
  await expect(page.getByText("La contraseña no es correcta.")).toBeVisible();

  // Ahora con la contraseña correcta: la cuenta se borra y vuelve al inicio.
  await page.getByLabel("Introduce tu contraseña para confirmar").fill(user.password);
  await page
    .getByRole("button", { name: "Sí, borrar mi cuenta definitivamente" })
    .click();
  await expect(page).toHaveURL("/");

  // La cuenta ya no existe: el login con las mismas credenciales debe fallar.
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
});
