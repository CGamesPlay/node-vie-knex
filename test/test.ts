import { makeEntity, QueryBuilder, Viewer as BaseViewer } from "../src/index";

class Viewer extends BaseViewer {
  userId: string = "1";

  user(): Promise<User> {
    return User.byId(this, this.userId) as Promise<User>;
  }
}

class Entity extends makeEntity<Viewer>() {
  generalHelper() {
    console.log("General Helper, reporting for duty!");
    console.log(this.$viewer.userId);
  }
}

class User extends Entity {
  id?: string;
  name?: string;

  static byId($viewer: Viewer, id: string): Promise<User | null> {
    return this.query($viewer)
      .where({ id })
      .getOne();
  }
}

class MessageQueryBuilder extends QueryBuilder<Message, Viewer> {
  byRecipient(recipientId: string): this {
    return this.where({ recipientId });
  }
}

class Message extends Entity {
  static query($viewer: Viewer): MessageQueryBuilder {
    return new MessageQueryBuilder(this, $viewer);
  }

  id?: string;
  subject?: string;

  test() {
    this.generalHelper();
  }
}

function main() {
  const $viewer = new Viewer({} as any);
  User.byId($viewer, "1").then(user => {
    if (!user) return;
    console.log(user.name);
    Message.query($viewer)
      .byRecipient("1")
      .getAll()
      .then(messages => {
        console.log(messages.map(m => m.subject));
      });
  });
}

main();
