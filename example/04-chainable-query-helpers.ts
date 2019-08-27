import { makeEntity, Viewer as VIEViewer, QueryBuilder } from "..";
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

const Entity = makeEntity<Viewer>();

class User extends Entity {
  static tableName = "users";

  id?: string;
  name?: string;
}

// In this example we are going to create a subclass of QueryBuilder with
// queries specific to the Message entity. This allows us to create composable
// high-level query fragments and combine them. QueryBuilder needs to know the
// returned Entity type, as well as the type of the Viewer.
class MessageQueryBuilder extends QueryBuilder<Message, Viewer> {
  // Normal instance methods can build on top of the standard QueryBuilder
  // methods to add logic.
  whereRecipient(recipientId: string): this {
    return this.where({ recipientId });
  }

  whereSender(senderId: string): this {
    return this.where({ senderId });
  }
}

class Message extends Entity {
  static tableName = "messages";

  // We override the static `.query` method for Message to return our custom
  // QueryBuilder instance.
  static query($viewer: Viewer): MessageQueryBuilder {
    return new MessageQueryBuilder(this, $viewer);
  }

  id?: string;
  text?: string;
}

function main() {
  return getKnex().then(knex => {
    const $viewer = new Viewer(knex, "1");
    return Promise.all([$viewer.user(), User.load($viewer, "2")]).then(
      ([alice, bob]: [User, User | null]) => {
        if (!bob) throw new Error("User Bob not found");
        console.log(alice.name, "<-", bob.name);
        // Here we can use the QueryBuilder methods in a chain to achieve the
        // behavior we want.
        return Message.query($viewer)
          .whereRecipient(alice.id as string)
          .whereSender(bob.id as string)
          .getAll()
          .then((messages: Array<Message>) => {
            messages.forEach(m => console.log(m.text));
          });
      },
    );
  });
}

main().then(() => process.exit(0), () => process.exit(1));
