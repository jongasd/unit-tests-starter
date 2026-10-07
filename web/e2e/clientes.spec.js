import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
});
test("listar clientes", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bruno Lima" })).toBeVisible();
});
test("create um cliente", async ({ page }) => {
  await page.getByLabel("Nome").fill("Carla Dias");
  await page.getByLabel("Email").fill("carla@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  const linha = page.getByRole("row", { name: /Carla Dias/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("carla@email.com");
});
test("mostrar erro sem campos", async ({ page }) => {
  await page.getByRole("button", { name: "Cadastrar" }).toClick();
  await expect(page.getByText("Nome e email sao obrigatorios")).toBeVisible();
});
test("impedir email duplicado", async ({ page }) => {
  await page.getByLabel("Nome").fill("Teste");
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.getByText("Email ja cadastrado")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(3);
});
test("editar um cliente", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await linha.getByRole("button", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("Bruno Lima");
  await expect(page.getByLabel("Email")).toHaveValue("bruno@email.com");
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
  await page.getByLabel("Nome").fill("Bruno Lima Silva");
  await page.getByRole("button", { name: "Salvar" }).click();
  const novaLinha = page.getByRole("row", { name: /Bruno Lima Silva/ });
  await expect(novaLinha).toBeVisible();
  await expect(novaLinha).toContainText("bruno@email.com");
  await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cancelar" }),
  ).not.toBeVisible();
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});
test("cancelar edição", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Ana Souza/ });
  await linha.getByRole("button", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("Ana Souza");
  await page.getByLabel("Nome").fill("Ana Souza Silva");
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Ana Souza Silva" }),
  ).not.toBeVisible();
});
test("editar para email já usado", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await linha.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(
    page.getByText("Email ja cadastrado")
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Bruno Lima/ })
  ).toContainText("bruno@email.com");
});
test("remover um cliente", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Bruno Lima/ });
  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(
    page.getByRole("row", { name: /Bruno Lima/ })
  ).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(2);
});
test("fluxo completo", async ({ page }) => {
  await page.getByLabel("Nome").fill("Diego");
  await page.getByLabel("Email").fill("diego@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(
    page.getByRole("row", { name: /Diego/ })
  ).toBeVisible();
  const linhaDiego = page.getByRole("row", { name: /Diego/ });
  await linhaDiego.getByRole("button", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("Diego");
  await page.getByLabel("Nome").fill("Diego Matos");
  await page.getByRole("button", { name: "Salvar" }).click();
  const linhaDiegoMatos = page.getByRole("row", {
    name: /Diego Matos/,
  });
  await expect(linhaDiegoMatos).toBeVisible();
  await page.getByLabel("Nome").fill("Outro Cliente");
  await page.getByLabel("Email").fill("diego@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(
    page.getByText("Email ja cadastrado")
  ).toBeVisible();
  await linhaDiegoMatos.getByRole("button", { name: "Remover" }).click();
  await expect(
    page.getByRole("row", { name: /Diego Matos/ })
  ).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(3);
});