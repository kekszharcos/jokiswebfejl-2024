import {Message} from "./Message";
import {User} from "./User";

export interface Chat {
  messages:Message[];
  users: User[];
}
