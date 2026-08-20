const arNum = new Intl.NumberFormat("ar-EG");
const arCompact = new Intl.NumberFormat("ar-EG", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** أرقام عربية مشرقية للعدّ والسنين */
export const fmtInt = (n: number): string => arNum.format(n);

export const fmtCompact = (n: number): string => arCompact.format(n);

export const fmtDate = (iso: string): string => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso + "T00:00:00"));
  } catch {
    return iso;
  }
};

export const fmtRuntime = (minutes: number): string => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${arNum.format(h)} س ${arNum.format(m)} د` : `${arNum.format(m)} د`;
};

export const fmtMoney = (usd: number): string => {
  if (!usd) return "—";
  return `${arCompact.format(usd)} $`;
};

export const yearOf = (iso: string): string => (iso ? iso.slice(0, 4) : "—");
