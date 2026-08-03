export const CHANNELS = [
  { id: "6ano", label: "6º-ano", category: "Fundamental" },
  { id: "7ano", label: "7º-ano", category: "Fundamental" },
  { id: "8ano", label: "8º-ano", category: "Fundamental" },
  { id: "9ano", label: "9º-ano", category: "Fundamental" },
  { id: "1em", label: "1º-em", category: "Ensino Médio" },
  { id: "2em", label: "2º-em", category: "Ensino Médio" },
  { id: "3em", label: "3º-em", category: "Ensino Médio" },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];

export const VOICE_CHANNELS = [
  { id: "voz-geral", label: "Sala Geral" },
  { id: "voz-fundamental", label: "Voz Fundamental" },
  { id: "voz-medio", label: "Voz Ensino Médio" },
] as const;

export type VoiceChannelId = (typeof VOICE_CHANNELS)[number]["id"];

export const TEXT_CATEGORIES = ["Fundamental", "Ensino Médio"] as const;