import * as dotenv from "dotenv";
dotenv.config();
import { VideosDAO } from "./DAO";

const getVideos = async () => {
  const req = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${process.env.PLAYLIST_ID}&key=${process.env.YOUTUBE_KEY}`
  );
  const data = await req.json();
  for (const item of data.items) {
    const videoExist = await VideosDAO.getByTitle(item.snippet.title);
    if (videoExist == null) {
      await VideosDAO.create({
        title: item.snippet.title,
        url:
          "https://www.youtube.com/watch?v=" + item.snippet.resourceId.videoId,
      });
    }
  }
};

export default getVideos;
