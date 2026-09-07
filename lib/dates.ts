// Date-only helpers (YYYY-MM-DD strings with no time component).
//
// Never `new Date("2024-01-01")`: that parses as UTC midnight, so any
// local-timezone read (toDateString, date-fns format, getDate, ...) shows a
// different calendar day depending on where the code runs. The server renders
// in UTC while browsers render in the visitor's zone, which produces
// server/client hydration mismatches (and wrong query params east of UTC).
// These helpers pin everything to LOCAL midnight instead, which renders and
// serializes identically everywhere.
export function parseDateOnly(iso: string): Date {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, m - 1, d);
}

export function formatDateOnly(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
