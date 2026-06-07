import { describe, it, expect } from "vitest";
import { sumarHoras, estaFueraDeHorario, calcularPrecioPorPersona } from "./booking";

describe("sumarHoras", () => {
  it("suma horas enteras sin pasar de día", () => {
    expect(sumarHoras("09:00", 2)).toBe("11:00");
    expect(sumarHoras("18:30", 1)).toBe("19:30");
  });

  it("preserva los minutos del inicio", () => {
    expect(sumarHoras("10:45", 3)).toBe("13:45");
  });

  it("acepta 0 horas (no modifica)", () => {
    expect(sumarHoras("09:00", 0)).toBe("09:00");
  });
});

describe("estaFueraDeHorario", () => {
  it("acepta reservas dentro del horario", () => {
    expect(estaFueraDeHorario("10:00", "12:00", "09:00", "21:00")).toBe(false);
  });

  it("rechaza inicio antes de la apertura", () => {
    expect(estaFueraDeHorario("08:00", "10:00", "09:00", "21:00")).toBe(true);
  });

  it("rechaza fin después del cierre", () => {
    expect(estaFueraDeHorario("20:00", "22:00", "09:00", "21:00")).toBe(true);
  });

  it("acepta el borde exacto del horario", () => {
    expect(estaFueraDeHorario("09:00", "21:00", "09:00", "21:00")).toBe(false);
  });
});

describe("calcularPrecioPorPersona", () => {
  it("divide el total entre el número de personas", () => {
    expect(calcularPrecioPorPersona(30, 3)).toBe(10);
  });

  it("redondea a 2 decimales", () => {
    expect(calcularPrecioPorPersona(10, 3)).toBe(3.33);
  });

  it("devuelve el total si no hay personas (caso defensivo)", () => {
    expect(calcularPrecioPorPersona(20, 0)).toBe(20);
  });

  it("funciona con una sola persona", () => {
    expect(calcularPrecioPorPersona(15.5, 1)).toBe(15.5);
  });
});
