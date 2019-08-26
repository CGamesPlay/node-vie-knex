export interface Knex extends Promise<Array<object>> {
  (table: string): Knex;
  where(...args: Array<any>): this;
  limit(l: number): this;
}

export class Viewer {
  constructor(public knex: Knex) {}
}
