export type Enum<T extends Record<string, unknown>> = T[keyof T]
