import { en } from "./dictionaries/en";

/** Recursively widen literal string types so other locales can supply their own text. */
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

/** The shape every locale dictionary must implement. */
export type Dictionary = Widen<typeof en>;

/** Dot-separated path of a string leaf inside the dictionary, e.g. `"nav.home"`. */
export type DictPath<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DictPath<T[K]>}`;
}[keyof T & string];

/** Translation function signature. */
export type Translate = (
  key: DictPath<Dictionary>,
  params?: Record<string, string | number>
) => string;
