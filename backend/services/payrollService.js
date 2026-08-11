function calculatePayroll({ basicSalary, allowances = 0, bonus = 0, tax = 0, pf = 0, otherDeductions = 0 }) {
  const grossSalary = Number(basicSalary) + Number(allowances) + Number(bonus);
  const totalDeductions = Number(tax) + Number(pf) + Number(otherDeductions);
  const netSalary = Math.max(0, grossSalary - totalDeductions);
  return { grossSalary, totalDeductions, netSalary };
}
module.exports = { calculatePayroll };
