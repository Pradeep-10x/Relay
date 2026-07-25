import {Server} from "socket.io";
 let io : Server;
 import { duplicateRedisClient, redis } from "./redis.js";
 import { logger } from "./logger.js";
 import { prisma } from "./prisma.js";
 import { createAdapter } from "@socket.io/redis-adapter";
 import { saveStrokeService } from "../modules/board/board.services.js";

 export const initSocket = (server : any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // Try Redis adapter. If Redis is unavailable, sockets still work in single-node mode.
  void (async () => {
    const pubClient = duplicateRedisClient(redis, "socket-pub", {
      lazyConnect: true,
    });
    const subClient = duplicateRedisClient(pubClient, "socket-sub", {
      lazyConnect: true,
    });

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.IO Redis adapter initialized");
    } catch (err) {
      logger.warn({ err }, "Socket.IO Redis adapter failed, running in single-node mode");
      pubClient.disconnect();
      subClient.disconnect();
    }
  })();
  io.on("connection", (socket) => {
    logger.info({ id: socket.id }, "Socket connected");
    
    socket.on("joinProjectBoard", async (projectId : string , userId : string) => {

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
      if(!membership) {
        socket.emit("error", { message: "User is not a member of this project" });
        return;
      }
      socket.join(`project-${projectId}`);
      logger.info({ projectId }, "joined project board");
    });

    socket.on("drawStroke", async ({projectId, stroke}) => {
       await saveStrokeService(projectId, stroke);
      socket.to(`project-${projectId}`).emit("drawStroke", stroke);
    });
    
    socket.on("clearBoard", async ({projectId}) => {
        await prisma.projectBoard.update({
            where: { projectId },
            data: { strokes: [] },
        });
      socket.to(`project-${projectId}`).emit("clearBoard");
    });
  
    socket.on("disconnect", () => {
      logger.info({ id: socket.id }, "Socket disconnected");
    });
  });
 };

 export const getIo = () => {
  if(!io) {
    throw new Error("Socket not initialized");
  }
  return io;
 };
