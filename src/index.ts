import { QueryBuilder } from "./QueryBuilder";
import { Viewer } from "./Viewer";
import { IEntityStatic, Entity } from "./Entity";

export { QueryBuilder, Viewer, IEntityStatic, Entity };

export function makeEntity<V extends Viewer>(): IEntityStatic<V> {
  return Entity;
}
