import { Viewer } from "./Viewer";
import { QueryBuilder } from "./QueryBuilder";
import { MaybePromise } from "./utils";

/**
 * All Entities in this library use string IDs in memory, even if the underlying
 * SQL implementation uses a number.
 */
export type ID = string;

/**
 * This interface is a used to allow passing Entity constructors around with a
 * well-known static API. Any place where an IEntityStatic is required, the
 * specific Entity subclass should be used. For documentation, consult
 * [[Entity]].
 *
 * You will rarely need to use this type directly, especially if you are using
 * [[makeEntity]].
 *
 * @typeparam V The Viewer subclass that the Entity uses.
 */
export interface IEntityStatic<V extends Viewer> {
  from($viewer: V, attrs: object): Promise<Entity<V> | undefined>;
  load<E extends IEntityStatic<V>>(
    this: E,
    $viewer: V,
    id: ID,
  ): Promise<InstanceType<E> | undefined>;
  query($viewer: V): QueryBuilder<any, V>;
  new ($viewer: V, attrs: object): Entity<V>;
  tableName: string;
  idColumn: string;
}

/**
 * The base Entity class from which all other Entities should be derived. It
 * provides the core functionality to load records from JSON and verify the
 * proper access at the data access level.
 *
 * **If you are implementing an Entity subclass, review these:**
 * - [[$viewer]] - The Viewer associated with the entity.
 * - [[tableName]] - Required on all subclasses.
 * - [[canSee]] - Optional if you want access control on the object.
 * - [[query]] - Optional if you want custom chainable queries.
 *
 * **If you are using an Entity, review these:**
 * - [[load]] - To load an Entity by ID.
 * - [[query]] - To perform queries for the Entity type.
 *
 * @typeparam V The Viewer subclass that will be used.
 */
export class Entity<V extends Viewer> {
  /**
   * This is method is used internally by the QueryBuilder to populate
   * an Entity from the raw JSON record. It should not be used by user code.
   * This method will resolve to null if the access check for the entity fails.
   *
   * @hidden
   */
  static from<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
    data: object,
  ): Promise<E | undefined> {
    // Ideally this would return an already-loaded object if the ID of something
    // already in the loader existed. DataLoader doesn't provide this
    // functionality, so we might end up with multiple copies of the same object
    // if we first load by ID and then pull that same object from an ad-hoc
    // query.
    const obj: E = new this($viewer, data) as E;
    return Promise.resolve(obj.canSee()).then(canSee => {
      if (!canSee) return undefined;
      $viewer.loader(this as any).prime((obj as any)[this.idColumn], obj);
      return obj;
    });
  }

  /**
   * Basic method to load an Entity from its ID. This method is batched and
   * memoized using DataLoader, so if you request the same ID multiple times,
   * you will receive the same Promise object each time.
   */
  static load<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
    id: ID,
  ): Promise<E | undefined> {
    return $viewer.loader(this as any).load(id);
  }

  /**
   * Main method to perform complex queries on Entities.
   */
  static query<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
  ): QueryBuilder<E, V> {
    return new QueryBuilder(this, $viewer);
  }

  /**
   * This must be overridden in each derived Entity. It specifies the table name
   * that the Entity type is stored in.
   */
  static tableName: string = undefined as any;
  /**
   * You may override this in a derived Entity class if you want to use
   * something other than `id` for the [[load]] method.
   */
  static idColumn: string = "id";

  /**
   * The Viewer associated with this Entity. This is useful when writing helper
   * methods to find associated entities, for example.
   */
  $viewer: V;

  /**
   * The constructor method is responsible for assigning all attributes
   * retrieved from the database to properties. You may override this in derived
   * classes, but you should never instantiate an Entity directly.
   */
  constructor($viewer: V, attrs: object) {
    this.$viewer = $viewer;
    Object.assign(this, attrs);
  }

  /**
   * This method may be overridden by derived classes to perform access control.
   * All methods of loading an Entity will perform a canSee check before
   * returning the Entity to calling code, and there is no way for calling code
   * to differentiate between an object that does not exist and an object that
   * fails the canSee check.
   */
  canSee(): MaybePromise<boolean> {
    return true;
  }

  /**
   * When serializing an Entity to JSON, ensure that only database attributes
   * are returned.
   */
  toJSON(): object {
    return { ...this, $viewer: undefined };
  }

  /**
   * This method is a shortcut for queries operating on the specific Entity. It
   * is useful when constructing update queries.
   */
  query(): QueryBuilder<this, V> {
    const ctor: IEntityStatic<V> = this.constructor as any;
    return ctor
      .query(this.$viewer)
      .where(ctor.idColumn, (this as any)[ctor.idColumn]);
  }

  /**
   * Update the attributes on this Entity and then issue an UPDATE query to
   * update the underlying database as well. The resolved promise will be the
   * updated Entity.
   */
  update(attrs: Partial<this>): Promise<this> {
    Object.assign(this, attrs);
    return this.query()
      .update(attrs)
      .then(() => this);
  }

  /**
   * Delete the Entity and clear out the Viewer's caches.
   */
  delete(): Promise<void> {
    const ctor: IEntityStatic<Viewer> = this.constructor as any;
    return this.query()
      .delete()
      .then(() => {
        this.$viewer.loader(ctor).clear((this as any)[ctor.idColumn]);
      });
  }
}
