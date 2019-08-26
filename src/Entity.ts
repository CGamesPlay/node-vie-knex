import { Viewer } from "./Viewer";
import { QueryBuilder } from "./QueryBuilder";

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
}

export class Entity<V> {
  static from<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
    data: object,
  ): Promise<E | null> {
    return Promise.resolve(new this($viewer, data)) as Promise<E | null>;
  }

  static load<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
    id: ID,
  ): Promise<E | null> {
    return this.query($viewer)
      .where("id", id)
      .getOne();
  }

  static query<E extends Entity<V>, V extends Viewer>(
    this: IEntityStatic<V>,
    $viewer: V,
  ): QueryBuilder<E, V> {
    return new QueryBuilder(this, $viewer);
  }

  static get tableName(): string {
    throw new Error("tableName not defined on " + this.name);
  }

  $viewer: V;

  constructor($viewer: V, attrs: object) {
    this.$viewer = $viewer;
    Object.assign(this, attrs);
  }
}
