import * as dotenv from "dotenv";
import express from "express";
import { Request, Response } from "express";
import { Bot, InlineKeyboard } from "grammy";
import { response } from "./utils/response";
import { ChatMessagesDAO, ChatSessionsDAO, UsersDAO } from "./utils/DAO";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
  res.send("Bot is alive");
});

app.listen(port, () => {
  console.log("server running");
});

const bot = new Bot(process.env.BOT_TOKEN as string);

bot.command("start", async (ctx) => {
  const userExist = await UsersDAO.getByTgid(String(ctx?.message?.from?.id));
  if (userExist != null) {
    //todo resume last chat
    ctx.reply("welcome back");
  } else {
    const newChat = await ChatSessionsDAO.create({});
    await UsersDAO.create({
      tgid: ctx?.message?.from?.id as number,
      chatsessions: [newChat.id],
      currentChat: newChat.id,
    });
    const message = ChatMessagesDAO.create({
      ChatSessionId: newChat.id,
      role: "user",
      text: "Hello",
    });
    let msg = await response("Hello", [
      { role: "user", parts: [{ text: "Hello" }] },
    ]);
    const messageResponse = ChatMessagesDAO.create({
      ChatSessionId: newChat.id,
      role: "model",
      text: msg,
    });

    ctx.reply(msg);
  }
});

bot.command("newchat", async (ctx) => {
  const newChat = await ChatSessionsDAO.create({});
  await UsersDAO.update(ctx?.message?.from?.id as number, {
    currentChat: newChat.id,
  });
  ctx.reply("new chat created");
});

bot.on("message:text", async (ctx) => {
  const currentChat = await UsersDAO.getByTgid(
    String(ctx?.message?.from?.id as number)
  );
  const message = await ChatMessagesDAO.create({
    ChatSessionId: currentChat.currentChat,
    role: "user",
    text: ctx.message.text,
  });
  const chat = await ChatMessagesDAO.getBySessionId(currentChat.currentChat);
  const chatHistory: any[] = [];
  chat.forEach((c) => {
    chatHistory.push({ role: c.role, parts: [{ text: c.text }] });
  });
  let msg = await response(ctx.message.text, chatHistory);
  const messageResponse = await ChatMessagesDAO.create({
    ChatSessionId: currentChat.currentChat,
    role: "model",
    text: msg,
  });
  ctx.reply(msg);
  if (chatHistory.length <= 3) {
    chatHistory.push({
      role: "user",
      parts: [{ text: "give a short title for our this discussion" }],
    });
    let title = await response(
      "give a short title for our this discussion",
      chatHistory
    );
    await ChatSessionsDAO.update(currentChat.currentChat, { title: title });
  }
});

bot.start();
