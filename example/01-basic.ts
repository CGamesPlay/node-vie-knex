import { makeEntity, Viewer } from "../src";
import { Knex, getKnex } from "./knex";

// When using TypeScript, you need to use the makeEntity function to provide the
// Viewer class that you are using. In this basic example, we are using the
// stock Viewer and Entity classes, so this is all that it needed.
const Entity = makeEntity<Viewer>();

// To define an Entity type, we subclass Entity and set the tableName to the
// correct value. If using TypeScript, you can declare the fields that are
// defined on the table. You can add any helper methods that you like.
class User extends Entity {
  static tableName = "users";

  id?: string;
  name?: string;

  userHelper() {
    console.log("I'm a User helper method for", this.name);
  }
}

function main() {
  return getKnex().then(knex => {
    // Create a Viewer by passing in a configured Knex object. All requests
    // associated with this Viewer will use this object.
    const $viewer = new Viewer(knex);
    // Use the load method to fetch a single object using its ID.
    return User.load($viewer, "1").then(user => {
      if (!user) throw new Error("User not found!");
      // The returned object is an instance of User and you can use the helper
      // methods defined on it.
      user.userHelper();
    });
  });
}

main().then(() => process.exit(0), () => process.exit(1));
