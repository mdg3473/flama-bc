export const CHANNELS = [
  { id: "6ano", label: "6º Ano" },
  { id: "7ano", label: "7º Ano" },
  { id: "8ano", label: "8º Ano" },
  { id: "9ano", label: "9º Ano" },
  { id: "1em", label: "1º E.M." },
  { id: "2em", label: "2º E.M." },
  { id: "3em", label: "3º E.M." },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];