export function money(value: number | string) {
  return `৳${Number(value).toFixed(2)}`;
}

export function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
