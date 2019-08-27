import Knex from "knex";

export { default as Knex } from "knex";

let knex: Knex | undefined;

const createTableUsers = (k: Knex) =>
  k.schema.createTable("users", table => {
    table.increments("id");
    table.string("name");
    table.timestamps();
  });

const createTableMessages = (k: Knex) =>
  k.schema.createTable("messages", table => {
    table.increments("id");
    table.string("text");
    table.integer("senderId");
    table.integer("recipientId");
    table.timestamps();
  });

function setupKnex(): Promise<Knex> {
  knex = Knex({
    client: "sqlite3",
    // Enable this if you would like to see the SQL.
    //debug: true,
    useNullAsDefault: true,
    connection: { filename: ":memory:" },
  });
  let k = knex as Knex;
  return Promise.all([createTableUsers(k), createTableMessages(k)])
    .then(() =>
      Promise.all([
        k("users").insert([{ name: "Alice" }, { name: "Bob" }]),
        k("messages").insert([
          { text: "Hello", senderId: "1", recipientId: "2" },
          { text: "Hi", senderId: "2", recipientId: "1" },
          { text: "What's up?", senderId: "1", recipientId: "2" },
          { text: "just reading some code", senderId: "2", recipientId: "1" },
        ]),
      ]),
    )
    .then(() => k);
}

export function getKnex(): Promise<Knex> {
  if (!knex) return setupKnex();
  return Promise.resolve(knex as Knex);
}
