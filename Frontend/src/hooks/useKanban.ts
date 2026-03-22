import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface WorkflowState {
    id: string;
    name: string;
}

export interface Issue {
    id: string;
    key: string;
    title: string;
    priority: string;
    assignee: {
        id: string;
        name: string;
        avatar: string | null;
    } | null;
    stateId: string;
    [key: string]: any;
}

export interface KanbanData {
    board: Record<string, Issue[]>;
    states: WorkflowState[];
}

export function useKanban(projectId: string | null) {
    const [data, setData] = useState<KanbanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBoard = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const res = await apiFetch(`/api/v1/projects/${projectId}/kanban`);
            if (res.ok) {
                const responseData = await res.json();
                setData(responseData);
            } else {
                setError('Failed to load board');
            }
        } catch (err: any) {
            console.error("Failed to fetch Kanban board", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    const moveIssue = async (issueId: string, newStateId: string, newStateName: string, sourceStateName: string, destinationIndex: number) => {
        if (!data) return;

        // Optimistic UI Update
        setData(prev => {
            if (!prev) return prev;
            
            const sourceColumn = [...prev.board[sourceStateName]];
            const destColumn = [...prev.board[newStateName]];
            
            const issueIndex = sourceColumn.findIndex(i => i.id === issueId);
            if (issueIndex === -1) return prev;
            
            const [movedIssue] = sourceColumn.splice(issueIndex, 1);
            movedIssue.stateId = newStateId;
            
            destColumn.splice(destinationIndex, 0, movedIssue);
            
            return {
                ...prev,
                board: {
                    ...prev.board,
                    [sourceStateName]: sourceColumn,
                    [newStateName]: destColumn
                }
            };
        });

        // Backend Update
        try {
            const res = await apiFetch(`/api/v1/issues/${issueId}/state`, {
                method: 'PATCH',
                body: JSON.stringify({ stateId: newStateId })
            });

            if (!res.ok) {
                throw new Error("API Update Failed");
            }
        } catch (err) {
            console.error("Failed to move issue", err);
            // Revert logic could go here by calling fetchBoard again
            fetchBoard();
        }
    };

    return { data, isLoading, error, moveIssue, refresh: fetchBoard };
}
