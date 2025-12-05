import type { Prisma } from "@prisma/client";

export type LessonLike = {
  data: Date;
  alunosMatriculados: number;
  presentes: number;
  ausentes: number;
  visitantes: number;
  totalAssistencias: number;
  biblias: number;
  revistas: number;
  revisao: number;
  ofertas: number | Prisma.Decimal;
};

export type LessonTotals = {
  matriculados: number;
  presentes: number;
  ausentes: number;
  visitantes: number;
  assistencias: number;
  biblias: number;
  revistas: number;
  revisoes: number;
  ofertas: number;
};

export type LessonAggregations = {
  monthly: Record<string, LessonTotals>;
  quarterly: Record<string, LessonTotals>;
  semester: Record<string, LessonTotals>;
  annual: LessonTotals;
};

const quarterLabels = ["T1", "T2", "T3", "T4"] as const;
const semesterLabels = ["S1", "S2"] as const;

const baseTotals = (): LessonTotals => ({
  matriculados: 0,
  presentes: 0,
  ausentes: 0,
  visitantes: 0,
  assistencias: 0,
  biblias: 0,
  revistas: 0,
  revisoes: 0,
  ofertas: 0,
});

const toAmount = (value: number | Prisma.Decimal): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
};

const pad = (value: number) => value.toString().padStart(2, "0");

const accumulator = (totals: LessonTotals, lesson: LessonLike) => {
  totals.matriculados += lesson.alunosMatriculados;
  totals.presentes += lesson.presentes;
  totals.ausentes += lesson.ausentes;
  totals.visitantes += lesson.visitantes;
  totals.assistencias += lesson.totalAssistencias;
  totals.biblias += lesson.biblias;
  totals.revistas += lesson.revistas;
  totals.revisoes += lesson.revisao;
  totals.ofertas += toAmount(lesson.ofertas);
};

const aggregateBy = (
  lessons: LessonLike[],
  keyFactory: (date: Date) => string,
) => {
  return lessons.reduce<Record<string, LessonTotals>>((acc, lesson) => {
    const key = keyFactory(lesson.data);
    if (!acc[key]) {
      acc[key] = baseTotals();
    }
    accumulator(acc[key], lesson);
    return acc;
  }, {});
};

export function buildLessonAggregations(
  lessons: LessonLike[],
): LessonAggregations {
  const annual = baseTotals();
  lessons.forEach((lesson) => accumulator(annual, lesson));

  const monthly = aggregateBy(lessons, (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  });

  const quarterly = aggregateBy(lessons, (date) => {
    const index = Math.floor(date.getMonth() / 3);
    return `${date.getFullYear()}-${quarterLabels[index] ?? "T1"}`;
  });

  const semester = aggregateBy(lessons, (date) => {
    const index = date.getMonth() < 6 ? 0 : 1;
    return `${date.getFullYear()}-${semesterLabels[index] ?? "S1"}`;
  });

  return {
    monthly,
    quarterly,
    semester,
    annual,
  };
}
