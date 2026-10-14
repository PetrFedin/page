/*
 * Independent, side-effect-free scenario arithmetic.
 * ALL user inputs are hypothetical. This module makes no price/valuation
 * assertions and does not access browser APIs, storage, tracking or network.
 */
const MAX_MONEY = 1e12;
const MAX_HOURS = 1e7;

const validNumber = (value, low, high, integer = false) => {
  if (value === '' || value === null || value === undefined ||
      (typeof value === 'string' && !value.trim())) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= low && n <= high &&
    (!integer || Number.isInteger(n));
};
const number = value => Number(value);

export function calculateSoftwareScenario({ hours, hoursPerWeek, reusePercent }) {
  if (!validNumber(hours, 1, MAX_HOURS) ||
      !validNumber(hoursPerWeek, 1, 2000) ||
      !validNumber(reusePercent, 0, 90)) return { ok:false, error:'invalid' };
  const effort = number(hours);
  const teamHours = number(hoursPerWeek);
  const reused = number(reusePercent) / 100;
  const adaptedHours = effort * (1 - reused);
  const costLow = effort * 25;
  const costHigh = effort * 49;
  const adaptedLow = adaptedHours * 25;
  const adaptedHigh = adaptedHours * 49;
  return {
    ok: true,
    baselineHours: effort,
    adaptedHours,
    baselineWeeks: effort / teamHours,
    adaptedWeeks: adaptedHours / teamHours,
    costLow, costHigh, adaptedLow, adaptedHigh,
    differenceLow: costLow - adaptedLow,
    differenceHigh: costHigh - adaptedHigh
  };
}

export function calculateTransformationScenario({
  manualHours, hourlyCost, efficiencyPercent, otherAnnualSavings,
  implementationBudget, annualSupport
}) {
  const fields = [
    [manualHours, 0, MAX_HOURS], [hourlyCost, 0, MAX_MONEY],
    [efficiencyPercent, 0, 100], [otherAnnualSavings, 0, MAX_MONEY],
    [implementationBudget, 0, MAX_MONEY], [annualSupport, 0, MAX_MONEY]
  ];
  if (fields.some(([v, low, high]) => !validNumber(v, low, high)))
    return { ok:false, error:'invalid' };
  const baselineLabor = number(manualHours) * number(hourlyCost);
  const laborSavings = baselineLabor * number(efficiencyPercent) / 100;
  const grossAnnual = laborSavings + number(otherAnnualSavings);
  const netAnnual = grossAnnual - number(annualSupport);
  const breakEvenYears = netAnnual > 0 ? number(implementationBudget) / netAnnual : null;
  return { ok:true, baselineLabor, laborSavings, grossAnnual, netAnnual,
    breakEvenYears, netFirstYear: netAnnual - number(implementationBudget) };
}

export function calculateEarlyAccessScenario({ futureMonthlyPrice, discountPercent, months }) {
  if (!validNumber(futureMonthlyPrice, 0, MAX_MONEY) ||
      !validNumber(discountPercent, 0, 100) ||
      !validNumber(months, 1, 120, true)) return { ok:false, error:'invalid' };
  const list = number(futureMonthlyPrice) * number(months);
  const discounted = list * (1 - number(discountPercent) / 100);
  return { ok:true, list, discounted, hypotheticalDifference: list - discounted };
}

export function calculateCapitalScenario({
  mode, assumedValuation, ticket, founderBefore = '', founderMinimum = ''
}) {
  if (!['primary','secondary'].includes(mode) ||
      !validNumber(assumedValuation, 1, MAX_MONEY) ||
      !validNumber(ticket, 1, MAX_MONEY)) return { ok:false, error:'invalid' };
  const beforeGiven = founderBefore !== '' && founderBefore !== undefined && founderBefore !== null;
  const floorGiven = founderMinimum !== '' && founderMinimum !== undefined && founderMinimum !== null;
  if ((beforeGiven && !validNumber(founderBefore, 0, 100)) ||
      (floorGiven && !validNumber(founderMinimum, 0, 100)) ||
      (floorGiven && (!beforeGiven || number(founderMinimum) > number(founderBefore)))) {
    return { ok:false, error:'invalid' };
  }
  const value = number(assumedValuation);
  const cash = number(ticket);
  if (mode === 'secondary' && cash > value) return { ok:false, error:'invalid' };
  if (mode === 'primary') {
    const post = value + cash;
    const investorPercent = cash / post * 100;
    const retained = beforeGiven ? number(founderBefore) * value / post : null;
    const minFounderRetained = floorGiven
      ? retained >= number(founderMinimum) - 1e-9 : null;
    return { ok:true, mode, postMoney: post, investorPercent,
      founderAfter: retained, founderFloorPass: minFounderRetained,
      companyProceeds: cash, sellerProceeds: 0 };
  }
  return { ok:true, mode, postMoney: null, investorPercent: cash / value * 100,
    founderAfter: null, founderFloorPass: null, companyProceeds: 0, sellerProceeds: cash };
}
