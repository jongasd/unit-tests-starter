const {
  soma,
  subtrai,
  multiplica,
  divide,
  ehPar,
  raiz,
  media,
} = require("./calculadora");

describe("soma", () => {
  test("Plus two positive numbers", () => {
    expect(soma(5, 5)).toBe(10);
  });
});

describe("raiz", () => {
  test("Square a number not exactly", () => {
    expect(raiz(2)).toBeCloseTo(1.414);
  });
  test("Test an error with a negative number", () => {
    expect(() => raiz(-2)).toThrow();
  });
});

// ---------------------------

describe("subtrai", () => {
  test("Subtract two numbers", () => {
    expect(subtrai(10, 8)).toBe(2);
  });
  test("Return a negative number", () => {
    expect(subtrai(6, 17)).toBe(-11);
  });
});

describe("Multiplica", ()=>{
    test("Multi two numbers", ()=>{
        expect(multiplica(2, 5)).toBe(10)
    })

    test("Tryng multi 0 per a number", ()=>{
        expect(multiplica(0, 10)).toBe(0)
    })
    test("Result of a multi with two numbers", ()=>{
        expect(multiplica(2, 5)).toBeGreaterThan(2, 5)
    })
})

describe("Divide", ()=>{
    test("Divide two numbers", ()=>{
        expect(divide(10, 2)).toBe(5)
    })
    test("Throw divide a number per 0", ()=>{
        expect(()=> divide(10, 0)).toThrow("Nao e possivel dividir por zero")
    })
})