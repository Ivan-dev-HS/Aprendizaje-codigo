import { expect, test } from "@playwright/test";
import { prisma } from "@codeforge/database";

function uniqueUser() {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  return {
    displayName: "Radia Perlman",
    username: `radia${id}`.slice(0, 20),
    email: `radia-${id}@example.local`,
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

test("autoasignar un ticket, comentar y moverlo a Done otorga XP", async ({ page }) => {
  // El tablero es compartido entre ejecuciones (sin copia privada por
  // usuario): se resetea aquí el ticket que usa este test (status, asignado
  // y comentarios previos) para que ejecuciones repetidas en local no lo
  // dejen sin tickets libres en Backlog, ni con comentarios acumulados que
  // vuelvan ambiguo el texto buscado más abajo (en CI, con base de datos
  // recién sembrada, esto es un no-op).
  const testTicket = await prisma.ticket.update({
    where: { code: "NEX-102" },
    data: { status: "BACKLOG", assigneeId: null },
  });
  await prisma.ticketComment.deleteMany({ where: { ticketId: testTicket.id } });

  await registerAndOnboard(page);

  await page.goto("/company");
  await expect(page.getByRole("heading", { name: "Nexora Tech" })).toBeVisible();
  await expect(page.getByText("NEX-101")).toBeVisible();

  // Se toma el primer ticket libre del Backlog en vez de uno fijo por
  // título: el tablero es compartido entre ejecuciones (no hay una copia
  // privada por usuario), así que un ticket concreto puede haber sido
  // autoasignado por una ejecución anterior de este mismo test.
  const backlogColumn = page.getByTestId("column-BACKLOG");
  await expect(backlogColumn.locator("a").first()).toBeVisible();
  await backlogColumn.locator("a").first().click();
  await expect(page).toHaveURL(/\/company\/tickets\//);

  await page.getByRole("button", { name: "Autoasignarme este ticket" }).click();
  await expect(page.getByLabel("Cambiar status")).toBeVisible();

  await page
    .getByPlaceholder("Añade un comentario…")
    .fill("Me pongo con esto ahora mismo.");
  await page.getByRole("button", { name: "Comentar" }).click();
  await expect(page.getByText("Me pongo con esto ahora mismo.")).toBeVisible();

  await page.getByLabel("Cambiar status").selectOption("DONE");
  await expect(page.getByText(/\+\d+ XP/)).toBeVisible();
});

test("el standup calcula una puntuación de comunicación y guarda historial", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/company/standup");
  await page
    .getByLabel("¿Qué hiciste ayer?")
    .fill("Terminé NEX-103 (actualización de ESLint) y revisé el PR de Marcos.");
  await page
    .getByLabel("¿Qué harás hoy?")
    .fill("Voy a empezar con NEX-101, el bug de Safari.");
  await page.getByRole("button", { name: "Enviar standup" }).click();

  await expect(page.getByText(/Puntuación de comunicación:/)).toBeVisible();
  await expect(page.getByText("Historial")).toBeVisible();
});

test("practicar code review marca issues reales y falsos positivos", async ({ page }) => {
  await registerAndOnboard(page);

  await page.goto("/company/code-reviews");
  await expect(
    page.getByRole("heading", { name: "Practicar code review" }),
  ).toBeVisible();
  await page.getByText("Añadir endpoint de login").click();

  await expect(page.getByText("SELECT * FROM users")).toBeVisible();
  await page
    .getByText("El email y la contraseña se concatenan directamente en el SQL")
    .click();
  await page.getByText("Falta un await antes de db.query(query)").click();

  await page.getByLabel("Veredicto").selectOption("REQUEST_CHANGES");
  await page.getByRole("button", { name: "Enviar review" }).click();

  await expect(page.getByText(/Puntuación: \d+\/100/)).toBeVisible();
});
