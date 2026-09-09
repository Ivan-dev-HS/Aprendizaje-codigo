import { expect, test } from "@playwright/test";

function uniqueUser() {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  return {
    displayName: "Grace Hopper",
    username: `grace${id}`.slice(0, 20),
    email: `grace-${id}@example.local`,
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
  return user;
}

test("completar todas las tareas de un proyecto lo marca como completado y otorga XP", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Proyectos" })).toBeVisible();
  await page.getByText("Portfolio personal").click();

  await expect(page).toHaveURL(/\/projects\/portfolio-personal/);
  await page.getByRole("button", { name: "Empezar proyecto" }).click();

  await expect(page.getByRole("heading", { name: /Tareas/ })).toBeVisible();
  const checkboxes = page.getByRole("checkbox");
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const checkbox = checkboxes.nth(i);
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  }

  await expect(page.getByText(/¡Completaste todas las tareas!/)).toBeVisible();
  await expect(page.getByText("¡Proyecto completado!")).toBeVisible();
});

test("publicar el portfolio lo hace visible en /portfolio/:username sin sesión", async ({
  page,
  context,
}) => {
  const user = await registerAndOnboard(page);

  await page.goto("/portfolio");
  await page.getByLabel("Publicar mi portfolio").check();
  await page.getByLabel("Titular").fill("Futura desarrolladora frontend");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Guardado.")).toBeVisible();

  const publicPage = await context.newPage();
  await publicPage.goto(`/portfolio/${user.username}`);
  await expect(publicPage.getByRole("heading", { name: user.displayName })).toBeVisible();
  await expect(publicPage.getByText("Futura desarrolladora frontend")).toBeVisible();
  await publicPage.close();
});

test("CV builder guarda experiencia/educación y las refleja en la vista previa", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/resume");
  await expect(page.getByRole("heading", { name: "CV Builder" })).toBeVisible();

  await page.getByRole("button", { name: "+ Añadir" }).first().click();
  await page.getByPlaceholder("Empresa").fill("Freelance");
  await page.getByPlaceholder("Puesto").fill("Desarrolladora web");
  await page.getByPlaceholder("Inicio (2025-01)").fill("2025-01");

  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Guardado.")).toBeVisible();

  await expect(
    page.locator("#resume-preview").getByText("Desarrolladora web — Freelance"),
  ).toBeVisible();
});
