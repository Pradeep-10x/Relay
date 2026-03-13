import {Server} from "socket.io";
 let io : Server;
 import { prisma } from "./prisma.js";

 export const initSocket = (server : any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
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
      socket.join(projectId);
      console.log(`join ${projectId}`);
    });

    socket.on("drawStroke", ({projectId, stroke}) => {
      socket.to(`project-${projectId}`).emit("drawStroke", stroke);
    });
    
    socket.on("clearBoard", ({projectId}) => {
      socket.to(`project-${projectId}`).emit("clearBoard");
    });
  });
 };

 export const getIo = () => {
  if(!io) {
    throw new Error("Socket not initialized");
  }
  return io;
 };