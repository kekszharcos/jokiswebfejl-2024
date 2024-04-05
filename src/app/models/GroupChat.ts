import {Chat} from "./Chat";
import {User} from "./User";

export interface  GroupChat{
  users?: User[];
  chat?: Chat;
  owner?: User;

}
