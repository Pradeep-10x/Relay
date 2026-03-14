import {Server} from "socket.io";
 let io : Server;
 import { redis } from "./redis.js";
 import { prisma } from "./prisma.js";
 import { createAdapter } from "@socket.io/redis-adapter";
 import { saveStrokeService } from "../modules/board/board.services.js";

 const boardBuffers : Record<string, any[]> = {};
 export const initSocket = (server : any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const pubClient = redis.duplicate();
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    
    socket.on("joinProjectBoard", (projectId : string , userId : string) => {

      const membership = prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
      if(!membership) {
        throw new Error("User is not a member of this project");
      }
      socket.join(`project-${projectId}`);
      console.log(`join ${projectId}`);
    });

    socket.on("drawStroke", async ({projectId, stroke}) => {
        if(!boardBuffers[projectId]) {
            boardBuffers[projectId] = [];
        }
        boardBuffers[projectId].push(stroke);
       await saveStrokeService(projectId, stroke);
      socket.to(`project-${projectId}`).emit("drawStroke", stroke);
    });
    
    socket.on("clearBoard", async ({projectId}) => {
        boardBuffers[projectId] = [];
        await prisma.projectBoard.update({
            where: { projectId },
            data: { strokes: [] },
        });
      socket.to(`project-${projectId}`).emit("clearBoard");
    });
  
    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });
 };
  setInterval(async() => {
    try {
      for(const projectId in boardBuffers) {
        const strokes = boardBuffers[projectId];
        if(!strokes || strokes.length === 0) continue;
        const board = await prisma.projectBoard.findUnique({
          where: { projectId },
        });
        if(!board) {
          await prisma.projectBoard.create({
            data: {
              projectId,
              strokes,
            },
          });
        } else {
          const existingStrokes = board.strokes as any[] || [];
          await prisma.projectBoard.update({
            where: { projectId },
            data: { strokes: [...existingStrokes, ...strokes] },
          });
        }
        boardBuffers[projectId] = [];
      }
    } catch (error) {
      console.log("Error in board save", error);
    }
    
  }, 3000);
 export const getIo = () => {
  if(!io) {
    throw new Error("Socket not initialized");
  }
  return io;
 };