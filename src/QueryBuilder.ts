import Knex from "knex";

import { Viewer } from "./Viewer";
import { Entity, IEntityStatic } from "./Entity";

export class QueryBuilder<E extends Entity<V>, V extends Viewer> {
  private query: Knex.QueryBuilder;

  constructor(private readonly entity: IEntityStatic<V>, protected $viewer: V) {
    if (!entity.tableName) {
      throw new Error("tableName not defined on " + entity.name);
    }
    this.query = this.$viewer.knex(entity.tableName);
  }

  where(first: any, ...args: Array<any>): this {
    this.query.where(first, ...args);
    return this;
  }

  whereIn(column: string, values: Array<any>): this {
    this.query.whereIn(column, values);
    return this;
  }

  getOne(): Promise<E | null> {
    return this.query.limit(1).then(results => {
      if (results.length === 0) return Promise.resolve(null);
      return this.entity.from(this.$viewer, results[0]) as Promise<E | null>;
    });
  }

  getAll(): Promise<Array<E>> {
    return this.query.then(results =>
      Promise.all(results.map(r => this.entity.from(this.$viewer, r))).then(
        arr => <any>arr.filter(x => x),
      ),
    );
  }
}
