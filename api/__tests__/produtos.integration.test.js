const request = require("supertest");
const createApp = require("../app");

describe("/produtos", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET", () => {
    test("sucessful return", async () => {
      const res = await request(app).get("/produtos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });
  });
  describe("GET /produtos/:id", () => {
    test("sucessful return", async () => {
      const res = await request(app).get("/produtos/1");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", 1);
    });

    test("produto nao encontrado", async () => {
      const res = await request(app).get("/produtos/999");

      expect(res.status).toBe(404);
    });
  });
  describe("POST", () => {
    test("cria produto e retorna status e JSON corretos", async () => {
      const novoProduto = { nome: "Batata", preco: 90 };

      const res = await request(app).post("/produtos").send(novoProduto);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(novoProduto);
      expect(res.body).toHaveProperty("id");
    });
  });
});
