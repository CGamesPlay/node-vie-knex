import { Viewer } from "./Viewer";
import { QueryBuilder } from "./QueryBuilder";
import { MaybePromise } from "./utils";

export type ID = string;

export interface IEntityStatic<V extends Viewer> {
  from($viewer: V, attrs: object): Promise<Entity<V> | null>;
  load<E extends IEntityStatic<V>>(
    this: E,
    $viewer: V,
    id: ID,
  ): Promise<InstanceType<E> | null>;
  query($viewer: V): QueryBuilder<any, V>;
  new ($viewer: V, attrs: object): Entity<V>;
  tableName: string;
  idColumn: string;
}

export class Entity<V> {
  static from<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
    data: object,
  ): Promise<E | null> {
    // Ideally this would return an already-loaded object if the ID of something
    // already in the loader existed. DataLoader doesn't provide this
    // functionality, so we might end up with multiple copies of the same object
    // if we first load by ID and then pull that same object from an ad-hoc
    // query.
    const obj: E = new this($viewer, data) as E;
    return Promise.resolve(obj.canSee()).then(canSee => {
      if (!canSee) return null;
      $viewer.loader(this as any).prime((obj as any)[this.idColumn], obj);
      return obj;
    });
  }

  static load<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
    id: ID,
  ): Promise<E | null> {
    return $viewer.loader(this as any).load(id);
  }

  static query<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
  ): QueryBuilder<E, V> {
    return new QueryBuilder(this, $viewer);
  }

  static tableName: string = undefined as any;
  static idColumn: string = "id";

  $viewer: V;

  constructor($viewer: V, attrs: object) {
    this.$viewer = $viewer;
    Object.assign(this, attrs);
  }

  canSee(): MaybePromise<boolean> {
    return true;
  }
}
