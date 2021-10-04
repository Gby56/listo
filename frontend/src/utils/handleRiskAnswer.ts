import { Risk, RiskOption } from '../types';

export const handleRiskAnswer = (risks: Risk[], setRisks: any) => (
  selectedIndex: number,
) => (_: React.ChangeEvent<{}>, value: string) => {
  const text = value;

  const updatedRisks = risks.map(
    (risk, index): Risk => {
      if (index === selectedIndex) {
        return {
          ...risk,
          options: risk.options.map(
            (option): RiskOption => ({
              ...option,
              selected: option.text === text,
            }),
          ),
        };
      }
      return risk;
    },
  );

  setRisks(updatedRisks);
};
