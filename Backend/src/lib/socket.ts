import {Server} from "socket.io";
 let io : Server;

 export const initSocket = (server : any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    
    socket.on("joinProjectBoard", (projectId : string) => {
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