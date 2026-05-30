// Loan-math engine for the Toollyz EMI Calculator and Loan Calculator.
// Pure functions, no DOM.

export type Frequency = "monthly" | "biweekly" | "weekly";

export interface LoanInput {
  principal: number;
  annualRatePct: number;
  termYears: number;
  frequency: Frequency;
  /** Optional extra payment applied to every period. */
  extraPerPeriod?: number;
}

export interface LoanSummary {
  periods: number;
  ratePerPeriod: number;
  payment: number;
  totalPaid: number;
  totalInterest: number;
  payoffMonths: number; // months until paid in full (incl. partial)
  payoffMonthsSaved: number;
}

export interface AmortizationRow {
  index: number;
  period: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  closingBalance: number;
}

const PERIODS_PER_YEAR: Record<Frequency, number> = {
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

export function periodsPerYear(f: Frequency): number {
  return PERIODS_PER_YEAR[f];
}

/**
 * Standard amortising loan payment, also known as EMI when frequency is
 * monthly. Returns the constant period payment that pays off the loan in
 * exactly `periods` periods at `ratePerPeriod`.
 */
export function calculatePayment(principal: number, ratePerPeriod: number, periods: number): number {
  if (principal <= 0 || periods <= 0) return 0;
  if (ratePerPeriod === 0) return principal / periods;
  const factor = Math.pow(1 + ratePerPeriod, periods);
  return (principal * ratePerPeriod * factor) / (factor - 1);
}

export function loanSummary(input: LoanInput): LoanSummary {
  const ppy = periodsPerYear(input.frequency);
  const periods = Math.max(1, Math.round(input.termYears * ppy));
  const ratePerPeriod = input.annualRatePct / 100 / ppy;
  const payment = calculatePayment(input.principal, ratePerPeriod, periods);
  // Simulate amortisation (with extra payment) to compute payoff and totals.
  let balance = input.principal;
  let totalPaid = 0;
  let totalInterest = 0;
  let count = 0;
  const extra = input.extraPerPeriod ?? 0;
  for (let i = 0; i < periods * 4 && balance > 0.0049; i++) {
    const interest = balance * ratePerPeriod;
    let principalDue = payment - interest + extra;
    if (principalDue > balance) principalDue = balance;
    const actualPayment = principalDue + interest;
    totalPaid += actualPayment;
    totalInterest += interest;
    balance -= principalDue;
    count += 1;
  }
  const monthsScheduled = (periods / ppy) * 12;
  const monthsPaid = (count / ppy) * 12;
  return {
    periods: count,
    ratePerPeriod,
    payment,
    totalPaid,
    totalInterest,
    payoffMonths: monthsPaid,
    payoffMonthsSaved: monthsScheduled - monthsPaid,
  };
}

export function amortizationSchedule(input: LoanInput): AmortizationRow[] {
  const ppy = periodsPerYear(input.frequency);
  const periods = Math.max(1, Math.round(input.termYears * ppy));
  const ratePerPeriod = input.annualRatePct / 100 / ppy;
  const payment = calculatePayment(input.principal, ratePerPeriod, periods);
  const extra = input.extraPerPeriod ?? 0;
  const rows: AmortizationRow[] = [];
  let balance = input.principal;
  for (let i = 0; i < periods * 4 && balance > 0.0049; i++) {
    const interest = balance * ratePerPeriod;
    let principalPart = payment - interest;
    const extraThis = balance - principalPart >= extra ? extra : Math.max(0, balance - principalPart);
    let payThis = payment + extraThis;
    if (principalPart + extraThis > balance) {
      principalPart = balance - extraThis;
      payThis = principalPart + extraThis + interest;
    }
    const closing = Math.max(0, balance - principalPart - extraThis);
    rows.push({
      index: i,
      period: i + 1,
      openingBalance: balance,
      payment: payThis,
      interest,
      principal: principalPart,
      extra: extraThis,
      closingBalance: closing,
    });
    balance = closing;
  }
  return rows;
}
