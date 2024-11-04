import { Schema, model, Document, Types } from 'mongoose';


interface IChatMessage {
  role: string;
  parts: {
    text: string;
  }[];
}


interface IChatSession extends Document {
  title: string;
  chats: IChatMessage[];
}


interface IUser extends Document {
  tgid: string;
  chatSessions: Types.ObjectId[];
  currentChat: Types.ObjectId;
}


const chatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    required: true
  },
  parts: [{
    text: {
      type: String,
      required: true
    }
  }]
});


const chatSessionSchema = new Schema<IChatSession>({
  title: {
    type: String,
    default: 'new chat'
  },
  chats: [chatMessageSchema]
});


const userSchema = new Schema<IUser>({
  tgid: {
    type: String,
    required: true
  },
  chatSessions: [{
    type: Schema.Types.ObjectId,
    ref: 'ChatSession'
  }],
  currentChat: { type: Schema.Types.ObjectId, ref: 'ChatSession' }
});


const ChatMessage = model<IChatMessage>('ChatMessage', chatMessageSchema);
const ChatSession = model<IChatSession>('ChatSession', chatSessionSchema);
const User = model<IUser>('User', userSchema);
export { ChatMessage, ChatSession, User };
