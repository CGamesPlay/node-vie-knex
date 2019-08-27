import Knex from "knex";
import DataLoader from "dataloader";

import { ID, IEntityStatic } from "./Entity";
import { mapByKeys } from "./utils";

export class Viewer {
  _loaders: Map<any, DataLoader<ID, any>> = new Map();

  constructor(public knex: Knex) {}

  loader<E extends IEntityStatic<Viewer>>(
    entity: E,
  ): DataLoader<ID, InstanceType<E>> {
    if (!this._loaders.has(entity)) {
      this._loaders.set(
        entity,
        new DataLoader((ids: Array<ID>) =>
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
