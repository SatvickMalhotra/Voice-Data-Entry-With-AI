
export const partnerData: Record<string, Record<string, { Premium: number; Tenure: number; "CSE Name": string }[]>> = {
  BANGIYA: {
    Combo: [
      { Premium: 490, Tenure: 1, "CSE Name": "Jahed" },
      { Premium: 690, Tenure: 1, "CSE Name": "Jahed" },
      { Premium: 980, Tenure: 2, "CSE Name": "Jahed" },
      { Premium: 990, Tenure: 1, "CSE Name": "Jahed" },
    ],
    Telemedicine: [
      { Premium: 360, Tenure: 1, "CSE Name": "Jahed" },
      { Premium: 700, Tenure: 2, "CSE Name": "Jahed" },
      { Premium: 1000, Tenure: 3, "CSE Name": "Jahed" },
      { Premium: 2000, Tenure: 6, "CSE Name": "Jahed" },
      { Premium: 3000, Tenure: 9, "CSE Name": "Jahed" },
    ],
  },
  PBGB: {
    Combo: [
      { Premium: 490, Tenure: 1, "CSE Name": "Aditya" },
      { Premium: 690, Tenure: 1, "CSE Name": "Aditya" },
    ],
    Telemedicine: [{ Premium: 365, Tenure: 1, "CSE Name": "Aditya" }],
  },
  UBKGB: {
    Combo: [
      { Premium: 490, Tenure: 1, "CSE Name": "Abhijit" },
      { Premium: 690, Tenure: 1, "CSE Name": "Abhijit" },
    ],
    Telemedicine: [{ Premium: 365, Tenure: 1, "CSE Name": "Abhijit" }],
  },
  KCCB: {
    Combo: [
      { Premium: 700, Tenure: 1, "CSE Name": "Aditya" },
      { Premium: 1050, Tenure: 1, "CSE Name": "Aditya" },
    ],
    Telemedicine: [{ Premium: 399, Tenure: 1, "CSE Name": "Aditya" }],
  },
  "Assam Vikas Gramin Bank": {
    Telemedicine: [{ Premium: 365, Tenure: 1, "CSE Name": "Abhishek" }],
  },
  DCCB: {
    Telemedicine: [{ Premium: 365, Tenure: 1, "CSE Name": "Abhishek" }],
  },
  UBGB: {
    Telemedicine: [{ Premium: 365, Tenure: 1, "CSE Name": "Nazreen" }],
  },
};

export const nomineeRelationships: string[] = [
  'Spouse',
  'Son',
  'Daughter',
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Grandfather',
  'Grandmother',
  'Nephew',
  'Niece',
  'Uncle',
  'Aunty',
  'Other'
];

export const themes: string[] = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];
