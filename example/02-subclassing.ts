import { makeEntity, Viewer as VIEViewer } from "..";
import { Knex, getKnex } from "./knex";

// In this example we subclass our Viewer to store the logged in userId. We also
// add a helper method to easily retrieve the User.
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

// In this example we also subclass the basic Entity class to add a helper
// method that is available to all of our application Entities.
class Entity extends makeEntity<Viewer>() {
  generalHelper() {
    console.log(
      "General Helper, reporting for duty! The viewer ID is",
      this.$viewer.userId,
    );
  }
}

class User extends Entity {
  static tableName = "users";

  id?: string;
  name?: string;

  userHelper() {
    console.log("I'm a User helper method for", this.name);
    this.generalHelper();
  }
}

function main() {
  return getKnex().then(knex => {
    const $viewer = new Viewer(knex, "1");
    // Here we use the helper we created above to easily access the logged-in
    // user.
    return $viewer.user().then(user => {
      user.userHelper();
    });
  });
}

main().then(() => process.exit(0), () => process.exit(1));
