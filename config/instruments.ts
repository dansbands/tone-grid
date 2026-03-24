export const instruments = [
  {
    id: "violin",
    name: "Violin",
    strings: [
      { label: "G", note: "G3" },
      { label: "D", note: "D4" },
      { label: "A", note: "A4" },
      { label: "E", note: "E5" },
    ],
  },
  {
    id: "five-string-violin",
    name: "5-string Violin",
    strings: [
      { label: "C", note: "C3" },
      { label: "G", note: "G3" },
      { label: "D", note: "D4" },
      { label: "A", note: "A4" },
      { label: "E", note: "E5" },
    ],
  },
  {
    id: "viola",
    name: "Viola",
    strings: [
      { label: "C", note: "C3" },
      { label: "G", note: "G3" },
      { label: "D", note: "D4" },
      { label: "A", note: "A4" },
    ],
  },
  {
    id: "cello",
    name: "Cello",
    strings: [
      { label: "C", note: "C2" },
      { label: "G", note: "G2" },
      { label: "D", note: "D3" },
      { label: "A", note: "A3" },
    ],
  },
  {
    id: "mandolin",
    name: "Mandolin",
    strings: [
      { label: "G", note: "G3" },
      { label: "D", note: "D4" },
      { label: "A", note: "A4" },
      { label: "E", note: "E5" },
    ],
  },
  {
    id: "guitar",
    name: "Guitar",
    strings: [
      { label: "E", note: "E2" },
      { label: "A", note: "A2" },
      { label: "D", note: "D3" },
      { label: "G", note: "G3" },
      { label: "B", note: "B3" },
      { label: "E", note: "E4" },
    ],
  },
  {
    id: "banjo-5-string",
    name: "Banjo (5-string)",
    strings: [
      { label: "G", note: "G3" },
      { label: "D", note: "D4" },
      { label: "G", note: "G4" },
      { label: "B", note: "B4" },
      { label: "D", note: "D5" },
    ],
  },
  {
    id: "bass",
    name: "Bass",
    strings: [
      { label: "E", note: "E1" },
      { label: "A", note: "A1" },
      { label: "D", note: "D2" },
      { label: "G", note: "G2" },
    ],
  },
  {
    id: "dobro-g",
    name: "Dobro (G tuning)",
    strings: [
      { label: "G", note: "G2" },
      { label: "B", note: "B2" },
      { label: "D", note: "D3" },
      { label: "G", note: "G3" },
      { label: "B", note: "B3" },
      { label: "D", note: "D4" },
    ],
  },
];

export const instrumentsById = Object.fromEntries(
  instruments.map((instrument) => [instrument.id, instrument])
);