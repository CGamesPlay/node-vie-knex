import { makeEntity, Viewer } from "..";
import { Knex, getKnex } from "./knex";

const Entity = makeEntity<Viewer>();

class User extends Entity {
  static tableName = "users";

  id?: string;
  name?: string;
}

// This function is an interactor. Technically there is nothing special about
// interactors, but conceptually they are should be the only places in your code
// where you perform mutations to the database.
function createUser($viewer: Viewer, attrs: Partial<User>): Promise<User> {
  return User.query($viewer).insert(attrs);
}

function updateUserName(
  $viewer: Viewer,
  user: User,
  name: string,
): Promise<User> {
  // This interactor uses the update method to modify the Entity.
  return user.update({ name: name });
}

function deleteUser($viewer: Viewer, user: User): Promise<void> {
  return user.delete();
}

function main() {
  return getKnex().then(knex => {
    const $viewer = new Viewer(knex);
    return createUser($viewer, { name: "Charles" }).then(user => {
      console.log("User created", user.name, user.id);
      return updateUserName($viewer, user, "David").then(user => {
        console.log("Name changed", user.name);
        return deleteUser($viewer, user).then(() => {
          console.log("User deleted");
        });
      });
    });
  });
}

main().then(() => process.exit(0), () => process.exit(1));
