const request = require("supertest");
const createApp = require("../app");

describe("/clientes", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /clientes/:id", () => {
    test("retorna 200 e o cliente quando o id existe", async () => {
      const res = await request(app).get("/clientes/1");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", 1);
      expect(res.body).toHaveProperty("email", "ana@email.com");
    });

    test("retorna 404 com { erro: ... } quando o cliente nao existe", async () => {
      const res = await request(app).get("/clientes/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("POST /clientes", () => {
    test("retorna 201 e o cliente criado com id gerado", async () => {
      const novoCliente = { nome: "Carla Dias", email: "carla@email.com" };

      const res = await request(app).post("/clientes").send(novoCliente);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(novoCliente);
      expect(res.body).toHaveProperty("id");
    });

    test("retorna 400 com { erro: ... } quando o nome estiver faltando", async () => {
      const res = await request(app)
        .post("/clientes")
        .send({ email: "carla@email.com" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 com { erro: ... } quando o email estiver faltando", async () => {
      const res = await request(app)
        .post("/clientes")
        .send({ nome: "Carla Dias" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("retorna 400 com { erro: ... } quando o email ja estiver cadastrado", async () => {
      const res = await request(app)
        .post("/clientes")
        .send({ nome: "Carla Dias", email: "ana@email.com" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });

    test("o cliente criado deve aparecer em uma chamada seguinte a GET /clientes", async () => {
      await request(app)
        .post("/clientes")
        .send({ nome: "Carla Dias", email: "carla@email.com" });

      const res = await request(app).get("/clientes");

      expect(res.body.map((c) => c.email)).toContain("carla@email.com");
    });
  });

  describe("PUT /clientes/:id", () => {
    test("retorna 200 e o cliente atualizado quando o id existe", async () => {
      const res = await request(app)
        .put("/clientes/1")
        .send({ nome: "Ana Souza Silva" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("nome", "Ana Souza Silva");
    });

    test("retorna 404 quando o id nao existe", async () => {
      const res = await request(app).put("/clientes/999").send({ nome: "X" });

      expect(res.status).toBe(404);
    });

    test("retorna 400 quando o novo email ja pertencer a outro cliente", async () => {
      const res = await request(app)
        .put("/clientes/1")
        .send({ email: "bruno@email.com" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("erro");
    });
  });

  describe("DELETE /clientes/:id", () => {
    test("retorna 204 quando o cliente e removido com sucesso", async () => {
      const res = await request(app).delete("/clientes/1");

      expect(res.status).toBe(204);
    });

    test("o cliente removido nao deve mais aparecer em GET /clientes/:id", async () => {
      await request(app).delete("/clientes/1");

      const res = await request(app).get("/clientes/1");

      expect(res.status).toBe(404);
    });

    test("retorna 404 com { erro: ... } quando o cliente nao existir", async () => {
      const res = await request(app).delete("/clientes/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("erro");
    });
  });
});
