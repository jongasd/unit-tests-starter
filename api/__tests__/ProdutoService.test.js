const ProdutoService = require("../services/ProdutoService");

describe("ProdutoService", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    service = new ProdutoService(mockRepository);
  });

  describe("Listar", () => {
    test("FindAll", () => {
      const produtos = [
        { id: 1, nome: "Batata", preco: 90 },
        { id: 2, nome: "aaaa", preco: 123 },
        { id: 3, nome: "1231", preco: 999 },
      ];
      mockRepository.findAll.mockReturnValue(produtos);
      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(produtos);
    });
  });
  describe("buscarPorId", () => {
    test("FindById", () => {
      const produtos = [
        { id: 1, nome: "Batata", preco: 90 },
        { id: 2, nome: "aaaa", preco: 123 },
        { id: 3, nome: "1231", preco: 999 },
      ];
      const id = 1;
      mockRepository.findById.mockReturnValue(produtos[id]);
      const resultado = service.buscarPorId(id);

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(produtos[1]);
    });
  });
  describe("Create", () => {
    test("cria produto chamando repository.create com os dados corretos", () => {
      const dados = { nome: "Batata", preco: 90 };
      const produtoCriado = { id: 1, ...dados };
      mockRepository.create.mockReturnValue(produtoCriado);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(produtoCriado);
    });
  });
});
