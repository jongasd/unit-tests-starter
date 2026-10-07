import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const resposta = await request.post("http://localhost:3000/__reset");
  expect(resposta.status()).toBe(204);
  await page.goto("/");
});
test("listar pedidos", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Ana Souza" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Ana 2x Coxinha" }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "R$ 10,00" })).toBeVisible();
  await expect(page.getByLabel("Status do pedido 1")).toBeVisible();
});
test("montar um pedido com um item", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Bruno Lima" });
  await page.getByLabel("Produto").selectOption({ label: "Pastel" });
  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("1x Pastel")).toBeVisible();
  await page.getByRole("button", { name: "Criar pedido" }).click();
  const linha = page.getByRole("row", { name: /Bruno Lima.*1x Pastel/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("Bruno Lima");
  await expect(linha).toContainText("1x Pastel");
  await expect(linha).toContainText("R$ 8,00");
  await expect(linha).toContainText("pendente");
  await expect(page.getByLabel("Cliente")).toHaveValue("");
  await expect(page.getByText("1x Pastel")).not.toBeVisible();
});

test("montar um pedido com vários itens e quantidades", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Ana Souza" });
  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("3");
  await expect(page.getByLabel("Quantidade")).toHaveValue("3");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("3x Coxinha")).toBeVisible();
  await page.getByLabel("Produto").selectOption({ label: "Empada" });
  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("1x Empada")).toBeVisible();
  await page.getByRole("button", { name: "Criar pedido" }).click();
  const linha = page.getByRole("row", {
    name: /Ana Souza.*3x Coxinha.*1x Empada/,
  });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("Ana Souza");
  await expect(linha).toContainText("3x Coxinha");
  await expect(linha).toContainText("1x Empada");
  await expect(linha).toContainText("R$ 21,00");
  await expect(linha).toContainText("pendente");
  await expect(page.getByLabel("Cliente")).toHaveValue("");
  await expect(page.getByText("3x Coxinha")).not.toBeVisible();
  await expect(page.getByText("1x Empada")).not.toBeVisible();
});

test("quantidade volta a 1 após adicionar item", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Ana Souza" });
  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("5");
  await expect(page.getByLabel("Quantidade")).toHaveValue("5");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("5x Coxinha")).toBeVisible();
  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
});

test("não criar pedido sem cliente", async ({ page }) => {
  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("1");
  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("Cliente e obrigatorio")).toBeVisible();
});
test("não criar pedido sem itens", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Ana Souza" });
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(
    page.getByText("Pedido deve ter ao menos um item"),
  ).toBeVisible();
});
test("alterar o status de um pedido", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");
  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");
});
test("pedido cancelado não pode ser alterado", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");
  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");
  await status.selectOption("pago");
  await expect(
    page.getByText("Pedido cancelado nao pode ser alterado"),
  ).toBeVisible();
  await expect(status).toHaveValue("cancelado");
});
test("remover um pedido", async ({ page }) => {
  const linha = page.getByRole("row", { name: /Pedido #1/ });
  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("row", { name: /Pedido #1/ })).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(1);
});

test("ciclo completo do pedido", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Bruno Lima" });
  await page.getByLabel("Produto").selectOption({ label: "Empada" });
  await page.getByLabel("Quantidade").fill("2");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("2x Empada")).toBeVisible();
  await page.getByRole("button", { name: "Criar pedido" }).click();
  const linha = page.getByRole("row", { name: /Bruno Lima.*2x Empada/ });
  const status = page.getByLabel("Status do pedido 2");
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("Bruno Lima");
  await expect(linha).toContainText("2x Empada");
  await expect(linha).toContainText("pendente");
  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");
  await status.selectOption("cancelado");
  await expect(
    page.getByText("Pedido pago nao pode ser cancelado"),
  ).toBeVisible();
  await expect(status).toHaveValue("pago");
  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");
  await status.selectOption("pendente");
  await expect(
    page.getByText("Pedido cancelado nao pode ser alterado"),
  ).toBeVisible();
  await expect(status).toHaveValue("cancelado");
  await linha.getByRole("button", { name: "Remover" }).click();
  await expect(
    page.getByRole("row", { name: /Bruno Lima.*2x Empada/ }),
  ).toHaveCount(0);
});
