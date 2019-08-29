import Knex from "knex";

import { Viewer } from "./Viewer";
import { Entity, IEntityStatic, ID } from "./Entity";

/**
 * The basic SQL QueryBuilder for retrieving and interacting with Entities. This
 * class wraps a [Knex QueryBuilder](https://knexjs.org/#Builder), but select
 * statements will return [[Entity]] objects instead of JSON objects.
 *
 * @typeparam E The [[Entity]] type that will be retrieved.
 * @typeparam V The Viewer class that will be used.
 */
export class QueryBuilder<E extends Entity<V>, V extends Viewer> {
  /**
   * The raw [Knex QueryBuilder](https://knexjs.org/#Builder) used by this
   * query. You can use this if the wrapped methods do not provide enough
   * flexibility.
   */
  protected query: Knex.QueryBuilder;

  /**
   * You can instantiate a QueryBuilder using [[Entity.query]].
   */
  constructor(
    /** @hidden */
    private readonly entity: IEntityStatic<V>,
    /**
     * The Viewer object associated with this query. You can use this when
     * writing custom query methods in subclasses.
     */
    protected $viewer: V,
  ) {
    if (!entity.tableName) {
      throw new Error("tableName not defined on " + entity.name);
    }
    this.query = this.$viewer.knex(entity.tableName);
  }

  /**
   * Set query debugging for this query.
   */
  debug(enabled: boolean = true): this {
    this.query.debug(enabled);
    return this;
  }

  where(first: any, ...args: Array<any>): this {
    this.query.where(first, ...args);
    return this;
  }

  whereIn(column: string, values: Array<any>): this {
    this.query.whereIn(column, values);
    return this;
  }

  whereBetween(column: string, range: [any, any]): this {
    this.query.whereBetween(column, range);
    return this;
  }

  update(first: any, second?: any, third?: any): Promise<void> {
    return this.query.update(first, second, third).then(() => undefined);
  }

  delete(): Promise<void> {
    return this.query.delete();
  }

  /**
   * Execute the query and return a single Entity as a result, or null if there
   * are none. The entity must be visible to the Viewer, see [[Entity.canSee]].
   */
  getOne(): Promise<E | null> {
    return this.query.limit(1).then(results => {
      if (results.length === 0) return Promise.resolve(null);
      return this.entity.from(this.$viewer, results[0]) as Promise<E | null>;
    });
  }

  /**
   * Execute the query and return all of the matching Entities as a result. All
   * entities will be visible to the Viewer, see [[Entity.canSee]].
   */
  getAll(): Promise<Array<E>> {
    return this.query.then(results =>
      Promise.all(results.map(r => this.entity.from(this.$viewer, r))).then(
        arr => <any>arr.filter(x => x),
      ),
    );
  }

  /**
   * Execute an insert query and return the newly-created entity. By default,
   * fields that are not specified in the data will not be assigned on the
   * resulting entity, except for the ID field. Even if the insert succeeds, if
   * the resulting object does not pass an [[Entity.canSee]] check, then the
   * promise will resolve to null. If the insert fails the promise will be
   * rejected.
   *
   * @param refetch If you want to issue a second query to fetch the record from
   * the database after inserting, so that default values will be present on the
   * returned Entity, set this to true.
   */
  insert(data: object, refetch: boolean = false): Promise<E | null> {
    if (Array.isArray(data)) throw new Error("Bulk insert not supported");
    return this.query.insert(data).then((res: Array<number>) => {
      if (refetch) {
        return this.entity.load(this.$viewer, res[0] as any);
      } else {
        let record = { [this.entity.idColumn]: res[0], ...data };
        return this.entity.from(this.$viewer, record);
      }
    }) as Promise<E | null>;
  }
}
