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
}

test("completar una simulación de entrevista de principio a fin otorga XP y muestra el desglose de scores", async ({
  page,
}) => {
  await registerAndOnboard(page);

  await page.goto("/interviews");
  await expect(
    page.getByRole("heading", { name: "Simulación de entrevistas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "IT Support" }).click();
  await page.getByText("Entrevista de IT Support").click();

  await expect(page).toHaveURL(/\/interviews\/entrevista-it-support/);
  await page.getByRole("button", { name: "Empezar entrevista" }).click();

  for (let i = 0; i < 4; i++) {
    await expect(page.getByText(/Pregunta \d de 4/)).toBeVisible();
    await page
      .getByPlaceholder("Escribe tu respuesta con tus propias palabras…")
      .fill(
        "Primero intentaría aislar el problema comprobando si afecta a otros dispositivos en la misma red, y luego revisaría la configuración antes de reiniciar nada.",
      );
    await page.getByRole("button", { name: "Enviar respuesta" }).click();
    await expect(page.getByText("FEEDBACK")).toBeVisible();

    const isLast = i === 3;
    await page
      .getByRole("button", { name: isLast ? "Ver resultados" : "Siguiente pregunta" })
      .click();
  }

  await expect(page.getByText("¡Entrevista completada!")).toBeVisible();
  await expect(page.getByText("Overall")).toBeVisible();
  await expect(page.getByText(/\+300 XP/)).toBeVisible();

  await page.getByRole("button", { name: "Ver detalle completo" }).click();
  await expect(page).toHaveURL(/\/interviews\/attempts\//);
  await expect(page.getByText("Respuesta modelo").first()).toBeVisible();
});
