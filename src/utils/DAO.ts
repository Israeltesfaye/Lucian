import supabase from "./db";
import { Database } from "../database.types";

export class ChatMessagesDAO {
  static async create(
    message: Database["public"]["Tables"]["ChatMessages"]["Insert"]
  ) {
    const { data, error } = await supabase
      .from("ChatMessages")
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from("ChatMessages")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async getBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from("ChatMessages")
      .select("*")
      .order("timestamp", { ascending: true })
      .eq("ChatSessionId", sessionId);
    if (error) throw error;
    return data;
  }

  static async update(
    id: string,
    message: Database["public"]["Tables"]["ChatMessages"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("ChatMessages")
      .update(message)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase.from("ChatMessages").delete().eq("id", id);
    if (error) throw error;
    return { message: "Chat message deleted successfully" };
  }
}

export class ChatSessionsDAO {
  static async create(
    session: Database["public"]["Tables"]["ChatSessions"]["Insert"]
  ) {
    const { data, error } = await supabase
      .from("ChatSessions")
      .insert(session)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from("ChatSessions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase.from("ChatSessions").select("*");
    if (error) throw error;
    return data;
  }

  static async update(
    id: string,
    session: Database["public"]["Tables"]["ChatSessions"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("ChatSessions")
      .update(session)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase.from("ChatSessions").delete().eq("id", id);
    if (error) throw error;
    return { message: "Chat session deleted successfully" };
  }
}

export class UsersDAO {
  static async create(user: Database["public"]["Tables"]["Users"]["Insert"]) {
    const { data, error } = await supabase.from("Users").insert(user).select();
    if (error) throw error;
    return data;
  }

  static async getByTgid(tgid: string) {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("tgid", tgid)
      .single();
    if (error) {
      if (error.code == "PGRST116") {
        return null;
      } else {
        throw error;
      }
    }
    return data;
  }

  static async getByCurrentChat(currentChat: string) {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("currentChat", currentChat);
    if (error) throw error;
    return data;
  }

  static async update(
    tgid: number,
    user: Database["public"]["Tables"]["Users"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("Users")
      .update(user)
      .eq("tgid", tgid)
      .select();
    if (error) throw error;
    return data;
  }

  static async delete(tgid: number) {
    const { error } = await supabase.from("Users").delete().eq("tgid", tgid);
    if (error) throw error;
    return { message: "User deleted successfully" };
  }
}

export class VideosDAO {
  static async create(video: Database["public"]["Tables"]["Videos"]["Insert"]) {
    const { data, error } = await supabase
      .from("Videos")
      .insert(video)
      .select();
    if (error) throw error;
    return data;
  }
  static async getByTitle(title: string) {
    const { data, error } = await supabase
      .from("Videos")
      .select("*")
      .eq("title", title)
      .single();
    if (error) {
      if (error.code == "PGRST116") {
        return null;
      } else {
        throw error;
      }
    }
    return data;
  }
}
