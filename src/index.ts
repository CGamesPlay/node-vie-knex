import { QueryBuilder } from "./QueryBuilder";
import { Viewer } from "./Viewer";
import { IEntityStatic, Entity, ID } from "./Entity";

export { QueryBuilder, Viewer, IEntityStatic, Entity, ID };

/**
 * This method is a helper for TypeScript to prepare the root Entity class. This
 * is only needed for TypeScript typings to work correctly.
 *
 * @typeparam V The Viewer subclass that will be used for all Entities.
 * @returns The root [[Entity]] class.
 */
export function makeEntity<V extends Viewer>(): IEntityStatic<V> {
  return Entity;
}
