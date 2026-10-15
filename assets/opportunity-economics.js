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


/**
 * First *whole billing month* where a linearly accumulated route cost meets
 * or passes a SaaS alternative's cumulative cost. These are *cost crossings*
 * (not returns, profits, discount rates, or financial break-even).
 *
 * A cost may start lower and become higher later: preserve the direction.
 * Never extrapolate a point past the user-selected observation horizon.
 */
export function findTCOMonthCrossing({
  alternativeUpfront, alternativeMonthly, saasUpfront, saasMonthly, horizonMonths
} = {}) {
  const fields=[alternativeUpfront,alternativeMonthly,saasUpfront,saasMonthly];
  if(fields.some(v=>!validNumber(v,0,MAX_MONEY)) ||
     !validNumber(horizonMonths,1,120,true))return {ok:false,error:'invalid'};
  const begin=number(alternativeUpfront)-number(saasUpfront);
  const slope=number(alternativeMonthly)-number(saasMonthly);
  if(begin===0) {
    return {ok:true,status:slope===0?'same_cost':'equal_initial',
      month:0,direction:slope<0?'alternative_lower':slope>0?'saas_lower':'equal'};
  }
  if(begin>0 && slope>=0)
    return {ok:true,status:'no_crossing',month:null,direction:'saas_lower'};
  if(begin<0 && slope<=0)
    return {ok:true,status:'no_crossing',month:null,direction:'alternative_lower'};
  const becomesAlternativeLower=begin>0;
  for(let month=1;month<=number(horizonMonths);month++){
    const delta=begin+slope*month;
    if(becomesAlternativeLower ? delta<=1e-6 : delta>=-1e-6) {
      return {ok:true,status:'crossed',month,
        direction:becomesAlternativeLower?'alternative_lower':'saas_lower'};
    }
  }
  return {ok:true,status:'beyond_horizon',month:null,
    direction:becomesAlternativeLower?'saas_lower':'alternative_lower'};
}

/**
 * Like-for-like observation horizon for three *hypothetical* delivery routes:
 * 1) bespoke development, 2) adaptation of reusable modules, 3) SaaS.
 * No benefit parity, market discount, quoted SYNTHA price, tax treatment,
 * time value of money or launch readiness is inferred from a lower TCO.
 * Every cost must be explicitly entered (even if the assumption is zero).
 */
export function calculateSoftwareTCO({
  hours, hoursPerWeek, reusePercent, horizonMonths,
  customOneTime, customMonthly,
  reuseOneTime, reuseMonthly, reuseLicenseMonthly,
  saasOneTime, saasMonthlyPlatform, saasUsers, saasMonthlySeat, saasMonthlyOperations
} = {}) {
  const labour = calculateSoftwareScenario({hours, hoursPerWeek, reusePercent});
  if (!labour.ok) return {ok:false,error:'invalid'};
  if (!validNumber(horizonMonths, 1, 120, true) ||
      !validNumber(saasUsers, 0, 100000, true)) return {ok:false,error:'invalid'};
  const costFields=[
    customOneTime, customMonthly, reuseOneTime, reuseMonthly,
    reuseLicenseMonthly, saasOneTime, saasMonthlyPlatform,
    saasMonthlySeat, saasMonthlyOperations
  ];
  if (costFields.some(x=>!validNumber(x,0,1e9))) return {ok:false,error:'invalid'};
  const months=number(horizonMonths);
  const bespokeUpfront=number(customOneTime);
  const integrationUpfront=number(reuseOneTime);
  const saasUpfront=number(saasOneTime);
  const bespokeMonthly=number(customMonthly);
  const integrationMonthly=number(reuseMonthly)+number(reuseLicenseMonthly);
  const saasMonthly=number(saasMonthlyPlatform)+
    number(saasUsers)*number(saasMonthlySeat)+number(saasMonthlyOperations);
  const custom={
    upfrontLow:labour.costLow+bespokeUpfront,
    upfrontHigh:labour.costHigh+bespokeUpfront,
    monthly:bespokeMonthly,
    totalLow:labour.costLow+bespokeUpfront+bespokeMonthly*months,
    totalHigh:labour.costHigh+bespokeUpfront+bespokeMonthly*months
  };
  const reuse={
    upfrontLow:labour.adaptedLow+integrationUpfront,
    upfrontHigh:labour.adaptedHigh+integrationUpfront,
    monthly:integrationMonthly,
    totalLow:labour.adaptedLow+integrationUpfront+integrationMonthly*months,
    totalHigh:labour.adaptedHigh+integrationUpfront+integrationMonthly*months
  };
  const saas={
    upfront:saasUpfront, monthly:saasMonthly,
    total:saasUpfront+saasMonthly*months
  };
  const toCrossing=(upfront,monthly)=>findTCOMonthCrossing({
    alternativeUpfront:upfront,alternativeMonthly:monthly,
    saasUpfront:saas.upfront,saasMonthly:saas.monthly,horizonMonths:months
  });
  const crossings={
    customLow:toCrossing(custom.upfrontLow,custom.monthly),
    customHigh:toCrossing(custom.upfrontHigh,custom.monthly),
    reuseLow:toCrossing(reuse.upfrontLow,reuse.monthly),
    reuseHigh:toCrossing(reuse.upfrontHigh,reuse.monthly)
  };
  return {ok:true,horizonMonths:months,custom,reuse,saas,crossings,
    assumption:'undiscounted_usd_cost_only_no_feature_parity'};
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
