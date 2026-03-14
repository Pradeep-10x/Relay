import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import { createCommentService, getIssueCommentsService, editCommentService, deleteCommentService } from "./comment.service.js";
import { commentParamsSchema, createCommentSchema, editCommentSchema } from "./comment.schema.js";

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { issueId, content } = createCommentSchema.parse(req.body);
    const userId = (req as any).user?.id;
    const comment = await createCommentService(issueId, userId!, content);
    res.status(201).json({ success: true, data: comment });
});

export const getIssueComments = asyncHandler(async (req: Request, res: Response) => {
    const { issueId } = commentParamsSchema.parse(req.params);
    const comments = await getIssueCommentsService(issueId as string);
    res.status(200).json({ success: true, data: comments });
});

export const editComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = commentParamsSchema.parse(req.params);
    const { content } = editCommentSchema.parse(req.body);
    const userId = (req as  any).user?.id;
    const comment = await editCommentService(commentId as string, userId!, content);
    res.status(200).json({ success: true, data: comment });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = commentParamsSchema.parse(req.params);
    const userId = (req as any).user?.id;
    const comment = await deleteCommentService(commentId as string, userId!);
    res.status(200).json({ success: true, data: comment });
});