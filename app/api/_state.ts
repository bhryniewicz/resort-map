const g = globalThis as unknown as { _bookedCabanas?: Set<number> };
export const bookedCabanas = (g._bookedCabanas ??= new Set<number>());
