import Knex from "knex";
import DataLoader from "dataloader";

import { ID, IEntityStatic } from "./Entity";
import { mapByKeys } from "./utils";

/**
 * The base Viewer class. This may be subclassed by application code if desired
 * to add helper methods.
 */
export class Viewer {
  private _loaders: Map<any, DataLoader<ID, any>> = new Map();

  /**
   * Pass a configured Knex instance to use for all requests associated with
   * this Viewer.
   */
  constructor(public knex: Knex) {}

  /**
   * Retrieve a batching, caching DataLoader for the provided Entity type. This
   * method is used internally by the [[Entity.load]] method, so you likely do
   * not need to use it in application code.
   */
  loader<E extends IEntityStatic<Viewer>>(
    entity: E,
  ): DataLoader<ID, InstanceType<E>> {
    if (!this._loaders.has(entity)) {
      this._loaders.set(
        entity,
        new DataLoader((ids: readonly string[]) =>
          entity
            .query(this)
            .whereIn(entity.idColumn, ids)
            .getAll()
            .then(results => mapByKeys(ids, entity.idColumn, results)),
        ),
      );
    }
    return this._loaders.get(entity) as DataLoader<ID, InstanceType<E>>;
  }
}
