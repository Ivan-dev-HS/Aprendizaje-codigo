import { expect, test } from "@playwright/test";
import { prisma } from "@codeforge/database";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.local");
  await page.getByLabel("Contraseña").fill("CodeForge2026!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("un admin puede gestionar contenido, feature flags, ver analítica y el audit log", async ({
  page,
}) => {
  // Limpia restos de ejecuciones anteriores que hayan fallado antes de
  // llegar al paso de borrado (el nombre siempre lleva este prefijo).
  await prisma.skill.deleteMany({
    where: { name: { startsWith: "Skill de prueba E2E " } },
  });

  await loginAsAdmin(page);

  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Panel de administración" }),
  ).toBeVisible();
  await expect(page.getByText("Usuarios totales")).toBeVisible();

  // CRUD genérico: crear, editar y borrar una skill de prueba.
  await page.goto("/admin/skills");
  await page.getByRole("button", { name: "+ Nuevo" }).click();
  const suffix = Date.now();
  const skillName = `Skill de prueba E2E ${suffix}`;
  await page.getByLabel("Slug *").fill(`e2e-admin-skill-${suffix}`);
  await page.getByLabel("Nombre *").fill(skillName);
  await page
    .getByLabel("Descripción *")
    .fill("Creada por un test E2E de administración.");
  await page.getByLabel("Categoría *").fill("testing");
  await page.getByRole("button", { name: "Guardar" }).click();
  await page.getByPlaceholder("Buscar…").fill(skillName);
  await expect(page.getByText(skillName)).toBeVisible();

  await page
    .locator("tr", { hasText: skillName })
    .getByRole("button", { name: "Editar" })
    .click();
  await page.getByLabel("Descripción *").fill("Descripción editada por el test E2E.");
  await page.getByRole("button", { name: "Guardar" }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("tr", { hasText: skillName })
    .getByRole("button", { name: "Borrar" })
    .click();
  await expect(page.getByText(skillName)).not.toBeVisible();

  // Feature flags: alternar una y volver a dejarla como estaba.
  await page.goto("/admin/feature-flags");
  const flagRow = page.getByTestId("feature-flag-CERTIFICATES");
  const checkbox = flagRow.getByRole("checkbox");
  const wasChecked = await checkbox.isChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked({ checked: !wasChecked });
  await checkbox.click();
  await expect(checkbox).toBeChecked({ checked: wasChecked });

  // Audit log: refleja las mutaciones anteriores.
  await page.goto("/admin/audit-log");
  await expect(page.getByText("Skill").first()).toBeVisible();
});

test("un usuario sin rol admin no puede acceder al panel", async ({ page }) => {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const user = {
    displayName: "No Admin",
    username: `noadmin${id}`.slice(0, 20),
    email: `no-admin-${id}@example.local`,
    password: "SuperSecreta123",
  };
  await page.goto("/register");
  await page.getByLabel("Nombre", { exact: true }).fill(user.displayName);
  await page.getByLabel("Nombre de usuario").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  // Espera a que la sesión quede establecida (redirección post-registro a
  // onboarding) antes de intentar entrar a /admin.
  await expect(page).toHaveURL(/\/onboarding/);

  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/);
});
