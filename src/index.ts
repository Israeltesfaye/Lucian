import * as dotenv from "dotenv"
import express from "express"
import { Request, Response } from "express"
import { Bot, InlineKeyboard } from "grammy"
import { connect, Document } from "mongoose"
import { response } from "./utils/response"
import { User, ChatSession, ChatMessage } from "./models"

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

app.get("/", (req: Request, res: Response) => {
  res.send("Bot is alive")
})

app.listen(port, () => {
  console.log("server running")
})

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI as string)
    console.log("db connected")
  } catch (error) {
    console.log(error)
  }
}

connectDB()

const bot = new Bot(process.env.BOT_TOKEN as string)

bot.command("start", async (ctx) => {
  const userExist = await User.findOne({ tgid: ctx?.message?.from?.id })
  if (userExist) {
    //todo resume last chat
    ctx.reply("welcome back")
  } else {
    const message = await ChatMessage.create({
      role: 'user',
      parts: [{ text: "Hello" }]
    })
    let msg = await response("Hello", [{ role: 'user', parts: [{ text: 'Hello' }] }])
    const messageResponse = await ChatMessage.create({
      role: 'model',
      parts: [{ text: msg }]
    })
    const chat = await ChatSession.create({
      chats: [message, messageResponse]
    })
    const user = await User.create({
      tgid: ctx?.message?.from?.id,
      chatSessions: [chat._id],
      currentChat: chat._id
    })

    ctx.reply(msg)
  }

})

bot.on("message:text", async (ctx) => {
  const user = await User.findOne({ tgid: ctx?.message?.from?.id })
  const chat = await ChatSession.findById(user?.currentChat)
  const message = await ChatMessage.create({
    role: 'user',
    parts: [{ text: ctx.message.text }]
  })
  chat?.chats.push(message)
  const history: any[] = []
  chat?.chats.forEach((c) => {
    history.push({
      role: c.role,
      parts: [{ text: c.parts[0].text }]
    })
  })
  let msg = await response(ctx.message.text, history)
  const messageResponse = await ChatMessage.create({
    role: 'model',
    parts: [{ text: msg }]
  })
  chat?.chats.push(messageResponse)
  await chat?.save()

  ctx.reply(msg)
})

bot.command("newchat", async (ctx) => {
  const chat = await ChatSession.create({
    chats: []
  })
  //update the currentChat
  User.findOneAndUpdate({ tgid: ctx?.message?.from?.id }, { currentChat: chat._id })
  ctx.reply("new chat created")
})

/*bot.command("chats",async(ctx)=>{
const user=await User.findOne({tgid:ctx?.message?.from?.id})
const keyboard=new InlineKeyboard()
user?.chatSessions.forEach(chat => {
  keyboard.text(chat as string).row()
});
  ctx.reply("select a chat",{
    reply_markup:keyboard
  })
})*/

bot.start()
