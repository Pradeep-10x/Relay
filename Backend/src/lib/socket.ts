import {Server} from "socket.io";
 let io : Server;
 import { redis } from "./redis.js";
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

  // Try Redis adapter — if it fails, socket still works (single-node mode)
  try {
    const pubClient = redis.duplicate();
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("Socket.IO Redis adapter initialized");
  } catch (err) {
    logger.warn("Socket.IO Redis adapter failed, running in single-node mode");
  }
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