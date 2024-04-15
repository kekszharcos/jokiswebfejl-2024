import {User} from "./User";

export interface Message {
  text:string;
  owner: User;
  time:Date;
}
