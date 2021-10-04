import { Risk } from '../types';

export const getIndexOfLatestAnswer = (risks: Risk[]) => {
  const index = risks
    .slice()
    .reverse()
    .findIndex(risk => risk.options.some(o => o.selected));

  return index >= 0 ? risks.length - 1 - index : index;
};

export const getRisksToDisplay = (risks: Risk[]) => {
  return risks;
};

export const getRiskLevel = (risks: Risk[]) => {
  
  const selectedRisks = risks.filter(r => r.options.filter(o=>o.selected).length > 0);
  const highRisk = selectedRisks.filter(r => r.options.filter(o => o.selected && o.risk == 'High Risk').length > 0);
  const mediumRisk = selectedRisks.filter(r => r.options.filter(o => o.selected && o.risk == 'Medium Risk').length > 0);
  const lowRisk = selectedRisks.filter(r => r.options.filter(o => o.selected && o.risk == 'Low Risk').length > 0);

  if(highRisk.length > 0) return 'High Risk';
  else if(mediumRisk.length > 0) return 'Medium Risk';
  else if(lowRisk.length > 0) return 'Low Risk';
  return null;
};
