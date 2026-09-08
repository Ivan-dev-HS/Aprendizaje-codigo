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

test("completar una lección otorga XP y desbloquea la siguiente", async ({ page }) => {
  await registerAndOnboard(page);

  await page.goto("/courses/html");
  await expect(page.getByRole("heading", { name: "HTML", exact: true })).toBeVisible();

  // El primer módulo está desbloqueado, el segundo bloqueado.
  await expect(page.getByText("🔒")).toBeVisible();

  await page.getByText("Estructura de un documento HTML").click();
  await expect(page).toHaveURL(/\/lessons\//);
  await expect(
    page.getByRole("heading", { name: "Estructura de un documento HTML" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await expect(page.getByText(/\+10 XP/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente →" })).toBeVisible();
});

test("una lección de un módulo bloqueado no es accesible directamente", async ({
  page,
}) => {
  await registerAndOnboard(page);

  const apiBase = process.env.E2E_API_URL ?? "http://localhost:4000/api/v1";
  const res = await page.request.get(`${apiBase}/courses/html`);
  const course = (await res.json()).course;
  const lockedLessonId = course.modules[1].lessons[0].id;

  await page.goto(`/lessons/${lockedLessonId}`);
  await expect(page.getByText(/Puede que el módulo esté bloqueado/)).toBeVisible();
});
