export interface Chat {
  id: string;
  messages: string[]; // array of message IDs or message objects
  users: { id: string; name: string; role: string }[]; // array of user objects
}