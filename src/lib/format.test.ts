import { describe, it, expect } from "vitest";
import { formatMoney, initialsFor } from "./format";

describe("formatMoney", () => {
  it("formatea enteros con dos decimales y símbolo €", () => {
    expect(formatMoney(10)).toMatch(/10,00\s*€/);
  });

  it("redondea a 2 decimales", () => {
    expect(formatMoney(12.345)).toMatch(/12,35\s*€/);
  });

  it("acepta strings numéricas", () => {
    expect(formatMoney("3.5")).toMatch(/3,50\s*€/);
  });

  it("trata null/undefined como 0", () => {
    expect(formatMoney(null)).toMatch(/0,00\s*€/);
    expect(formatMoney(undefined)).toMatch(/0,00\s*€/);
  });

  it("trata valores no finitos como 0", () => {
    expect(formatMoney("no soy un número")).toMatch(/0,00\s*€/);
  });
});

describe("initialsFor", () => {
  it("toma las dos primeras iniciales del nombre", () => {
    expect(initialsFor("Rodrigo Cabo", null)).toBe("RC");
  });

  it("solo una inicial si solo hay una palabra", () => {
    expect(initialsFor("Madonna", null)).toBe("M");
  });

  it("usa la parte local del email si no hay nombre", () => {
    expect(initialsFor(null, "rodrigo.cabo@example.com")).toBe("RC");
  });

  it('devuelve "?" si no hay ni nombre ni email', () => {
    expect(initialsFor(null, null)).toBe("?");
    expect(initialsFor("", "")).toBe("?");
  });

  it("ignora separadores comunes (espacios, puntos, guiones)", () => {
    expect(initialsFor("ana-maria perez", null)).toBe("AM");
  });
});
