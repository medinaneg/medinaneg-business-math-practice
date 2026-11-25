/** Sample Day 1 — Level 1 · Grade 8 business math (Philippine peso contexts) */
/** Static Day 1 fallback when daily assignment JSON is unavailable */
export const quizMeta = {
  title: "Sample Day 1 — Level 1",
  subtitle: "Grade 8 · Business Math · Basic · One-step · Whole numbers",
};

export const questions = [
  {
    id: 1,
    topic: "Commission and wages",
    subSkill: "Straight commission",
    prompt:
      "Miguel works part-time at a phone shop. He earns 5% commission on every phone he sells. This week he sold one phone for ₱12,000. How much commission does Miguel earn?",
    choices: [
      { key: "A", text: "₱600" },
      { key: "B", text: "₱240" },
      { key: "C", text: "₱12,005" },
      { key: "D", text: "₱60,000" },
    ],
    correct: "A",
    solution: {
      answerLabel: "A (₱600)",
      summary: "Commission = percent × sales.",
      steps: ["5% × ₱12,000 = 0.05 × 12,000 = ₱600."],
      wrongAnswers: [
        "B (₱240): Uses 2% or misreads 5% as ₱240.",
        "C (₱12,005): Adds 5 pesos instead of taking 5% of sales.",
        "D (₱60,000): Multiplies by 5 instead of finding 5% of 12,000.",
      ],
    },
  },
  {
    id: 2,
    topic: "Commission and wages",
    subSkill: "Hourly wages",
    prompt:
      "Ana helps at her family’s sari-sari store after school. She is paid ₱75 per hour and works 6 hours on Saturday. How much does she earn for that day (before any deductions)?",
    choices: [
      { key: "A", text: "₱81" },
      { key: "B", text: "₱450" },
      { key: "C", text: "₱375" },
      { key: "D", text: "₱525" },
    ],
    correct: "B",
    solution: {
      answerLabel: "B (₱450)",
      summary: "Hourly pay = rate × hours.",
      steps: ["₱75 × 6 = ₱450."],
      wrongAnswers: [
        "A (₱81): Adds 75 + 6 instead of multiplying.",
        "C (₱375): Uses 5 hours instead of 6.",
        "D (₱525): Uses 7 hours or adds an extra hour by mistake.",
      ],
    },
  },
  {
    id: 3,
    topic: "Commission and wages",
    subSkill: "Salary + commission",
    prompt:
      "Jake’s part-time job pays a fixed ₱2,500 per week plus 4% commission on his sales. In one week his sales total ₱15,000. What is his total gross pay for that week?",
    choices: [
      { key: "A", text: "₱600" },
      { key: "B", text: "₱15,000" },
      { key: "C", text: "₱3,100" },
      { key: "D", text: "₱17,500" },
    ],
    correct: "C",
    solution: {
      answerLabel: "C (₱3,100)",
      summary: "Gross pay = fixed salary + commission on sales.",
      steps: [
        "Commission: 4% × ₱15,000 = 0.04 × 15,000 = ₱600.",
        "Total: ₱2,500 + ₱600 = ₱3,100.",
      ],
      wrongAnswers: [
        "A (₱600): Commission only; forgets weekly salary.",
        "B (₱15,000): Uses sales total as pay.",
        "D (₱17,500): Adds full sales to salary instead of commission only.",
      ],
    },
  },
  {
    id: 4,
    topic: "Best buy",
    subSkill: "Unit price",
    prompt:
      "Your class needs identical ballpens. Store A sells 10 pens for ₱120. Store B sells 5 pens for ₱70. Which store has the lower price per pen?",
    choices: [
      { key: "A", text: "Store A (₱12 per pen)" },
      { key: "B", text: "Store B (₱14 per pen)" },
      { key: "C", text: "Store A (₱20 per pen)" },
      { key: "D", text: "Store B (₱12 per pen)" },
    ],
    correct: "A",
    solution: {
      answerLabel: "A (Store A, ₱12 per pen)",
      summary: "Unit price = total price ÷ number of items.",
      steps: [
        "Store A: ₱120 ÷ 10 = ₱12 per pen.",
        "Store B: ₱70 ÷ 5 = ₱14 per pen.",
        "Lower unit price: Store A.",
      ],
      wrongAnswers: [
        "B: Correct unit price for B but wrong conclusion (B is not cheaper).",
        "C: Divides pens by price instead of price by pens.",
        "D: Copies Store A’s unit price but assigns it to Store B.",
      ],
    },
  },
  {
    id: 5,
    topic: "Best buy",
    subSkill: "Package sizes / comparing totals",
    prompt:
      "A 500 mL bottle of hand soap costs ₱85. A 250 mL bottle of the same brand costs ₱50. Maria only needs 250 mL and will buy one bottle. Which choice costs less for what she needs?",
    choices: [
      { key: "A", text: "Buy the 500 mL bottle (₱85)" },
      { key: "B", text: "Buy the 250 mL bottle (₱50)" },
      { key: "C", text: "Buy two 250 mL bottles (₱100)" },
      { key: "D", text: "Buy the 500 mL bottle because unit price is ₱0.17/mL" },
    ],
    correct: "B",
    solution: {
      answerLabel: "B (₱50 for one 250 mL bottle)",
      summary: "Lowest cost for 250 mL, not best unit price on a larger bottle.",
      steps: [
        "One 250 mL bottle = ₱50.",
        "One 500 mL bottle = ₱85 (more than she needs and costs more).",
      ],
      wrongAnswers: [
        "A / D: Chooses 500 mL because unit price is better per mL, but Maria only needs 250 mL.",
        "C: Buys two small bottles when one is enough.",
      ],
    },
  },
  {
    id: 6,
    topic: "Profit and sales",
    subSkill: "Markup (amount added to cost)",
    prompt:
      "A shop buys a school supply item at ₱80 and adds a ₱20 markup. What is the selling price?",
    choices: [
      { key: "A", text: "₱60" },
      { key: "B", text: "₱100" },
      { key: "C", text: "₱400" },
      { key: "D", text: "₱25" },
    ],
    correct: "B",
    solution: {
      answerLabel: "B (₱100)",
      summary: "Selling price = cost + markup (in pesos).",
      steps: ["₱80 + ₱20 = ₱100."],
      wrongAnswers: [
        "A (₱60): Subtracts markup instead of adding.",
        "C (₱400): Treats markup as a percent incorrectly.",
        "D (₱25): Divides or confuses markup with profit percent.",
      ],
    },
  },
  {
    id: 7,
    topic: "Profit and sales",
    subSkill: "Discount (selling price after percent off)",
    prompt:
      "A gadget accessory is tagged ₱500. During a school fair it is sold at 10% off. What is the sale price?",
    choices: [
      { key: "A", text: "₱490" },
      { key: "B", text: "₱450" },
      { key: "C", text: "₱50" },
      { key: "D", text: "₱550" },
    ],
    correct: "B",
    solution: {
      answerLabel: "B (₱450)",
      summary: "Discount amount = percent × original price; sale price = original − discount.",
      steps: [
        "Discount: 10% × ₱500 = ₱50.",
        "Sale price: ₱500 − ₱50 = ₱450.",
      ],
      wrongAnswers: [
        "A (₱490): Subtracts only ₱10 instead of 10%.",
        "C (₱50): Gives discount amount only, not sale price.",
        "D (₱550): Adds 10% instead of subtracting.",
      ],
    },
  },
  {
    id: 8,
    topic: "Installment buying",
    subSkill: "Down payment",
    prompt:
      "Ron wants to buy a tablet priced ₱10,000 on installment. The store requires a 15% down payment. How much is the down payment?",
    choices: [
      { key: "A", text: "₱8,500" },
      { key: "B", text: "₱1,500" },
      { key: "C", text: "₱150" },
      { key: "D", text: "₱10,150" },
    ],
    correct: "B",
    solution: {
      answerLabel: "B (₱1,500)",
      summary: "Down payment = percent × cash price.",
      steps: ["15% × ₱10,000 = 0.15 × 10,000 = ₱1,500."],
      wrongAnswers: [
        "A (₱8,500): Finds amount financed, not down payment.",
        "C (₱150): Computes 1.5% instead of 15%.",
        "D (₱10,150): Adds 15 pesos instead of 15%.",
      ],
    },
  },
  {
    id: 9,
    topic: "Installment buying",
    subSkill: "Monthly payment (equal installments)",
    prompt:
      "After a down payment, ₱7,200 remains to be paid on a laptop. The balance is split into 12 equal monthly payments with no interest. How much is each monthly payment?",
    choices: [
      { key: "A", text: "₱600" },
      { key: "B", text: "₱720" },
      { key: "C", text: "₱12,000" },
      { key: "D", text: "₱840" },
    ],
    correct: "A",
    solution: {
      answerLabel: "A (₱600)",
      summary: "Monthly payment = financed amount ÷ number of months.",
      steps: ["₱7,200 ÷ 12 = ₱600."],
      wrongAnswers: [
        "B (₱720): Divides by 10 months instead of 12.",
        "C (₱12,000): Uses original laptop price, not financed balance.",
        "D (₱840): Adds down payment back into the amount divided.",
      ],
    },
  },
  {
    id: 10,
    topic: "Installment buying",
    subSkill: "Extra cost vs paying cash",
    prompt:
      "A pair of school shoes costs ₱2,400 cash. On installment, the total amount paid is ₱2,760. How much more does the buyer pay compared to cash?",
    choices: [
      { key: "A", text: "₱240" },
      { key: "B", text: "₱360" },
      { key: "C", text: "₱2,760" },
      { key: "D", text: "₱5,160" },
    ],
    correct: "B",
    solution: {
      answerLabel: "B (₱360)",
      summary: "Extra cost = installment total − cash price.",
      steps: ["₱2,760 − ₱2,400 = ₱360."],
      wrongAnswers: [
        "A (₱240): Subtracts in wrong order or uses monthly payment by mistake.",
        "C (₱2,760): States installment total, not the difference.",
        "D (₱5,160): Adds cash and installment totals instead of finding the difference.",
      ],
    },
  },
];