import { makeEntity, Viewer as VIEViewer } from "..";
import { Knex, getKnex } from "./knex";

class Viewer extends VIEViewer {
  constructor(knex: Knex, public userId: string) {
    super(knex);
  }

  user(): Promise<User> {
    return User.load(this, this.userId).then(user => {
      if (!user) throw new Error("Invalid userId");
      return user;
    });
  }
}

// We don't need to subclass Entity for this example, but we still need to
// associate the Entity with our custom Viewer implementation.
const Entity = makeEntity<Viewer>();

class User extends Entity {
  static tableName = "users";

  // Here we define a static method on the User entity to store the logic for a
  // simple query: finding a user by name.
  static loadByName($viewer: Viewer, name: string) {
    // To do an ad-hoc query, use the static `.query` method. This is a wrapped
    // Knex QueryBuilder that returns Entities.
    return (
      User.query($viewer)
        .where({ name })
        // In Knex we use `.then`, but here we use `.getOne` or `.getAll`
        .getOne()
    );
  }

  id?: string;
  name?: string;
}

function main() {
  return getKnex().then(knex => {
    const $viewer = new Viewer(knex, "1");
    return Promise.all([$viewer.user(), User.loadByName($viewer, "Bob")]).then(
      ([alice, bob]: [User, User | null]) => {
        if (!bob) throw new Error("User Bob not found");
        console.log(alice.name, "<-", bob.name);
      },
    );
  });
}

main().then(() => process.exit(0), () => process.exit(1));
