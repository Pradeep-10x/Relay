import {Server} from "socket.io";
 let io : Server;
 import { duplicateRedisClient, redis } from "./redis.js";
 import { logger } from "./logger.js";
 import { prisma } from "./prisma.js";
 import { createAdapter } from "@socket.io/redis-adapter";
 import { saveStrokeService } from "../modules/board/board.services.js";
 import { verifyAccessToken } from "../utils/jwt.js";

 const parseSocketOrigins = () => {
   const raw = process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_ORIGIN;
   if (!raw) return "*" as const;
   return raw.split(",").map((o) => o.trim()).filter(Boolean);
 };

 export const initSocket = (server : any) => {
  io = new Server(server, {
    cors: {
      origin: parseSocketOrigins(),
      credentials: true,
    },
  });

  // Authenticate the connection from the handshake if a token is supplied.
  // Backwards compatible: unauthenticated sockets still connect (whiteboard
  // guests) but only authenticated sockets join their private notification room.
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.query?.token as string | undefined);
    if (token) {
      try {
        const payload = verifyAccessToken(token) as { sub?: string };
        if (payload?.sub) {
          socket.data.userId = payload.sub;
        }
      } catch {
        // Invalid token → treat as an unauthenticated guest, don't reject.
      }
    }
    next();
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
    const authedUserId: string | undefined = socket.data.userId;
    // Join a private room so notifications can be delivered to this user.
    if (authedUserId) {
      socket.join(authedUserId);
    }
    // Track which project rooms this socket has been authorised into, so
    // board-mutating events can be verified without a DB hit per stroke.
    const joinedProjects = new Set<string>();
    socket.data.joinedProjects = joinedProjects;

    logger.info({ id: socket.id, userId: authedUserId }, "Socket connected");

    socket.on("joinProjectBoard", async (projectId : string , userId : string) => {
      // Prefer the authenticated identity; fall back to the provided id for
      // backwards compatibility with existing clients.
      const effectiveUserId = authedUserId ?? userId;
      if (!effectiveUserId || !projectId) {
        socket.emit("error", { message: "Missing user or project id" });
        return;
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: effectiveUserId,
            projectId,
          },
        },
      });
      if(!membership) {
        socket.emit("error", { message: "User is not a member of this project" });
        return;
      }
      joinedProjects.add(projectId);
      socket.join(`project-${projectId}`);
      logger.info({ projectId }, "joined project board");
    });

    socket.on("drawStroke", async ({projectId, stroke}) => {
      if (!projectId || !joinedProjects.has(projectId)) {
        socket.emit("error", { message: "Join the project board before drawing" });
        return;
      }
      try {
        await saveStrokeService(projectId, stroke);
        socket.to(`project-${projectId}`).emit("drawStroke", stroke);
      } catch (err) {
        logger.error({ err, projectId }, "Failed to persist stroke");
        socket.emit("error", { message: "Failed to save stroke" });
      }
    });

    socket.on("clearBoard", async ({projectId}) => {
      if (!projectId || !joinedProjects.has(projectId)) {
        socket.emit("error", { message: "Join the project board before clearing" });
        return;
      }
      try {
        await prisma.projectBoard.update({
            where: { projectId },
            data: { strokes: [] },
        });
        socket.to(`project-${projectId}`).emit("clearBoard");
      } catch (err) {
        logger.error({ err, projectId }, "Failed to clear board");
        socket.emit("error", { message: "Failed to clear board" });
      }
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
