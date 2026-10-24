const SUPPLIER = /maverick|kurv|nexio|nuvei|disputifier/i;

/** Merchant-visible copy must not name the companies that receive a file. */
export function mentionsSupplier(text: string): boolean {
  return SUPPLIER.test(text);
}

export const SUPPLIER_ERROR =
  "Use plain language here. Do not name the company that will receive the file. That name stays on the processor record and in internal notes.";
