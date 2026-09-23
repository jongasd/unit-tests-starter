const request = require("supertest");
const createApp = require("../app");

describe("/pedidos", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /pedidos/:id", () => {
    test("retorna 200 e o pedido quando o id existe", async () => {
      const res = await request(app).get("/pedidos/1");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", 1);
      expect(res.body).toHaveProperty("cliente", "Ana Souza");
    });

    test("retorna 404 com { erro: ... } quando o pedido nao existe", async () => {
      const res = await request(app).get("/pedidos/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("POST /pedidos", () => {
    test("retorna 201 e o pedido criado com o total calculado corretamente", async () => {
      const novoPedido = {
        cliente: "Bruno Lima",
        itens: [
          { nome: "Pastel", precoUnitario: 7, quantidade: 3 },
          { nome: "Refrigerante", precoUnitario: 5, quantidade: 2 },
        ],
      };

      const res = await request(app).post("/pedidos").send(novoPedido);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("status", "pendente");
      expect(res.body.total).toBe(31); // 7*3 + 5*2
    });

    test("retorna 400 quando o cliente estiver faltando", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({ itens: [{ nome: "Pastel", precoUnitario: 7, quantidade: 3 }] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando a lista de itens estiver vazia", async () => {
      const res = await request(app).post("/pedidos").send({ cliente: "Bruno Lima", itens: [] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 quando algum item tiver preco ou quantidade invalidos", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({
          cliente: "Bruno Lima",
          itens: [{ nome: "Pastel", precoUnitario: 0, quantidade: 3 }],
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("PATCH /pedidos/:id/status", () => {
    test("retorna 200 e o pedido com o novo status quando o id existe", async () => {
      const res = await request(app).patch("/pedidos/1/status").send({ status: "pago" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "pago");
    });

    test("retorna 404 quando o pedido nao existe", async () => {
      const res = await request(app).patch("/pedidos/999/status").send({ status: "pago" });

      expect(res.status).toBe(404);
    });

    test("retorna 400 quando o status enviado for invalido", async () => {
      const res = await request(app).patch("/pedidos/1/status").send({ status: "entregue" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 ao tentar alterar o status de um pedido ja cancelado", async () => {
      await request(app).patch("/pedidos/1/status").send({ status: "cancelado" });

      const res = await request(app).patch("/pedidos/1/status").send({ status: "pago" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("DELETE /pedidos/:id", () => {
    test("retorna 204 quando o pedido e removido com sucesso", async () => {
      const res = await request(app).delete("/pedidos/1");

      expect(res.status).toBe(204);
    });

    test("o pedido removido nao deve mais aparecer em GET /pedidos/:id", async () => {
      await request(app).delete("/pedidos/1");

      const res = await request(app).get("/pedidos/1");

      expect(res.status).toBe(404);
    });

    test("retorna 404 com { erro: ... } quando o pedido nao existir", async () => {
      const res = await request(app).delete("/pedidos/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });
});