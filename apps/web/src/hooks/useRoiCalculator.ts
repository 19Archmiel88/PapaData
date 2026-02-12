import { useCallback, useMemo, useState } from "react";

const TYGODNIE_NA_MIESIAC = 4.33;
const ZYSK_EFEKTYWNOSCI = 0.45;

const LIMITY = {
  analysts: { min: 1, max: 200 },
  hoursPerAnalystPerWeek: { min: 0, max: 80 },
} as const;

const clamp = (wartosc: number, min: number, max: number) => Math.min(max, Math.max(min, wartosc));

export type SegmentRoi = "ecommerce" | "agency" | "enterprise";

type UseRoiCalculatorProps = {
  rateEco: number;
  rateAge: number;
  rateEnt: number;
  defaultSegment?: SegmentRoi;
  defaultAnalysts?: number;
  defaultHoursPerAnalystPerWeek?: number;
};

export function useRoiCalculator({
  rateEco,
  rateAge,
  rateEnt,
  defaultSegment = "ecommerce",
  defaultAnalysts = 3,
  defaultHoursPerAnalystPerWeek = 12,
}: UseRoiCalculatorProps) {
  const [segment, setSegment] = useState<SegmentRoi>(defaultSegment);
  const [analysts, setAnalysts] = useState(() =>
    clamp(Math.floor(defaultAnalysts), LIMITY.analysts.min, LIMITY.analysts.max)
  );
  const [hoursPerAnalystPerWeek, setHoursPerAnalystPerWeek] = useState(() =>
    clamp(
      defaultHoursPerAnalystPerWeek,
      LIMITY.hoursPerAnalystPerWeek.min,
      LIMITY.hoursPerAnalystPerWeek.max
    )
  );

  const hourlyRate = useMemo(() => {
    if (segment === "ecommerce") return rateEco;
    if (segment === "agency") return rateAge;
    return rateEnt;
  }, [segment, rateAge, rateEco, rateEnt]);

  const metrics = useMemo(() => {
    const totalHoursWeekly = analysts * hoursPerAnalystPerWeek;
    const totalHoursMonthly = totalHoursWeekly * TYGODNIE_NA_MIESIAC;
    const recoveredHoursWeekly = totalHoursWeekly * ZYSK_EFEKTYWNOSCI;
    const recoveredHoursMonthly = totalHoursMonthly * ZYSK_EFEKTYWNOSCI;
    const manualCostMonthly = Math.round(totalHoursMonthly * hourlyRate);
    const savedCostMonthly = Math.round(recoveredHoursMonthly * hourlyRate);

    return {
      hourlyRate,
      totalHoursWeekly: Number(totalHoursWeekly.toFixed(1)),
      totalHoursMonthly: Number(totalHoursMonthly.toFixed(1)),
      recoveredHoursWeekly: Number(recoveredHoursWeekly.toFixed(1)),
      recoveredHoursMonthly: Number(recoveredHoursMonthly.toFixed(1)),
      manualCostMonthly,
      savedCostMonthly,
      manualCost: manualCostMonthly,
      recoveredTime: Number(recoveredHoursWeekly.toFixed(1)),
      totalSavings: savedCostMonthly,
    };
  }, [analysts, hoursPerAnalystPerWeek, hourlyRate]);

  const changeSegment = useCallback((next: SegmentRoi) => setSegment(next), []);
  const updateAnalysts = useCallback((next: number) => {
    setAnalysts(clamp(Math.floor(next), LIMITY.analysts.min, LIMITY.analysts.max));
  }, []);
  const updateHours = useCallback((next: number) => {
    setHoursPerAnalystPerWeek(
      clamp(next, LIMITY.hoursPerAnalystPerWeek.min, LIMITY.hoursPerAnalystPerWeek.max)
    );
  }, []);

  return {
    segment,
    analysts,
    hours: hoursPerAnalystPerWeek,
    hoursPerAnalystPerWeek,
    changeSegment,
    updateAnalysts,
    updateHours,
    ...metrics,
  };
}

export default useRoiCalculator;
