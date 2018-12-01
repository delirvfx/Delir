export type Branded<T, Ident extends string> = T & { [k in Ident]: never }
