import * as dotenv from "dotenv";
import express from "express";
import { Request, Response } from "express";
import { Bot } from "grammy";
import * as cron from "node-cron";
import { response } from "./utils/response";
import { ChatMessagesDAO, ChatSessionsDAO, UsersDAO } from "./utils/DAO";
import getVideos from "./utils/videos";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req: Request, res: Response) => {
  res.send("Bot is alive");
});

app.listen(port, () => {
  console.log("server running");
});

cron.schedule(
  process.env.SCHEDULE as string,
  async () => {
    await getVideos();
  },
  {
    timezone: "Africa/Addis_Ababa",
  }
);

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
  const user = await UsersDAO.getByTgid(String(ctx?.message?.from?.id));
  const newChat = await ChatSessionsDAO.create({});
  await UsersDAO.update(ctx?.message?.from?.id as number, {
    currentChat: newChat.id,
    chatsessions: [...user.chatsessions, newChat.id],
  });
  ctx.reply("new chat created");
});

bot.command("chatlist", async (ctx) => {
  const user = await UsersDAO.getByTgid(String(ctx?.message?.from?.id));
  let chatlist: any[] = [];
  for (const id of user.chatsessions) {
    const chat = await ChatSessionsDAO.getById(id);
    chatlist.push([{ text: chat.title, callback_data: chat.id }]);
  }
  ctx.reply("chats", { reply_markup: { inline_keyboard: chatlist } });
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  await UsersDAO.update(ctx?.callbackQuery?.from?.id, {
    currentChat: callbackData,
  });
  ctx.reply("chat changed");
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
