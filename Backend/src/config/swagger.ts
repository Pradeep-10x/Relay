import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Relay API',
      version: '1.0.0',
      description: 'API documentation for Relay - a Jira-like project management backend.',
    },
    servers: [
      {
        url: `http://localhost:${env?.PORT || 5000}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            name: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            key: { type: 'string' },
            issueCounter: { type: 'integer' },
            workspaceId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Issue: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            key: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            version: { type: 'integer' },
            projectId: { type: 'string', format: 'uuid' },
            reporterId: { type: 'string', format: 'uuid' },
            assigneeId: { type: 'string', format: 'uuid', nullable: true },
            stateId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
             id: { type: 'string', format: 'uuid' },
             issueId: { type: 'string', format: 'uuid' },
             userId: { type: 'string', format: 'uuid' },
             content: { type: 'string' },
             edited: { type: 'boolean' },
             deleted: { type: 'boolean' },
             createdAt: { type: 'string', format: 'date-time' },
             updatedAt: { type: 'string', format: 'date-time' },
          }
        },
        Notification: {
          type: 'object',
          properties: {
             id: { type: 'string', format: 'uuid' },
             userId: { type: 'string', format: 'uuid' },
             type: { type: 'string' },
             issueId: { type: 'string', format: 'uuid', nullable: true },
             commentId: { type: 'string', format: 'uuid', nullable: true },
             read: { type: 'boolean' },
             createdAt: { type: 'string', format: 'date-time' },
          }
        },
        RefreshToken: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            token: { type: 'string' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            revoked: { type: 'boolean' },
          }
        },
        WorkspaceMember: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            workspaceId: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
            createdAt: { type: 'string', format: 'date-time' },
          }
        },
        WorkspaceInvite: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workspaceId: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
            token: { type: 'string' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
          }
        },
        ProjectMember: {
          type: 'object',
          properties: {
            userId: { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
            joinedAt: { type: 'string', format: 'date-time' },
          }
        },
        WorkflowState: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            projectId: { type: 'string', format: 'uuid' },
            order: { type: 'integer' },
          }
        },
        WorkflowTransition: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            fromStateId: { type: 'string', format: 'uuid' },
            toStateId: { type: 'string', format: 'uuid' },
            allowedRoles: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
          }
        },
        IssueDependency: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            blockerId: { type: 'string', format: 'uuid' },
            blockedId: { type: 'string', format: 'uuid' },
          }
        },
        IssueActivity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            issueId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            field: { type: 'string' },
            fromValue: { type: 'string', nullable: true },
            toValue: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          }
        },
        ProjectBoard: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            strokes: { type: 'object' },
            updatedAt: { type: 'string', format: 'date-time' },
          }
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication related endpoints' },
      { name: 'Users', description: 'User profile endpoints' },
      { name: 'Workspaces', description: 'Workspace management endpoints' },
      { name: 'Projects', description: 'Project management endpoints' },
      { name: 'Issues', description: 'Issue tracking endpoints' },
      { name: 'Comments', description: 'Issue comment endpoints' },
      { name: 'Notifications', description: 'User notifications endpoints' },
      { name: 'Whiteboard', description: 'Drawing board endpoints' },
      { name: 'Kanban', description: 'Kanban board endpoints' }
    ]
  },
  apis: ['./src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
