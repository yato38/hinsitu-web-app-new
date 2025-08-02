'use client';

import { useState, useCallback } from 'react';
import { SystemPrompt } from '@/types/prompts';

export function useSystemPrompts() {
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (subjectId?: string) => {
    try {
      setIsLoading(true);
      
      if (!subjectId) {
        setSystemPrompts([]);
        return;
      }
      
      const response = await fetch(`/api/prompts/system?subjectId=${subjectId}`);
      
      if (!response.ok) {
        throw new Error('システムプロンプトの取得に失敗しました');
      }
      
      const data = await response.json();
      setSystemPrompts(data.systemPrompts || []);
    } catch (error) {
      console.error('システムプロンプト取得エラー:', error);
      // エラー時は空の配列を設定
      setSystemPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPrompt = useCallback(async (prompt: Omit<SystemPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/prompts/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'システムプロンプトの作成に失敗しました');
      }

      const data = await response.json();
      
      // 作成後に一覧を再取得
      await fetchData(prompt.subjectId);
      
      return data.systemPrompt;
    } catch (error) {
      console.error('システムプロンプト作成エラー:', error);
      throw error;
    }
  }, [fetchData]);

  const editPrompt = useCallback(async (promptId: string, updates: Partial<SystemPrompt>) => {
    try {
      const response = await fetch('/api/prompts/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: promptId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'システムプロンプトの更新に失敗しました');
      }

      const data = await response.json();
      
      // 更新後に一覧を再取得（subjectIdが必要）
      const currentPrompt = systemPrompts.find(p => p.id === promptId);
      if (currentPrompt) {
        await fetchData(currentPrompt.subjectId);
      }
      
      return data.systemPrompt;
    } catch (error) {
      console.error('システムプロンプト更新エラー:', error);
      throw error;
    }
  }, [fetchData, systemPrompts]);

  const deletePrompt = useCallback(async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/system?id=${promptId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'システムプロンプトの削除に失敗しました');
      }

      // 削除後に一覧を再取得（subjectIdが必要）
      const currentPrompt = systemPrompts.find(p => p.id === promptId);
      if (currentPrompt) {
        await fetchData(currentPrompt.subjectId);
      }
    } catch (error) {
      console.error('システムプロンプト削除エラー:', error);
      throw error;
    }
  }, [fetchData, systemPrompts]);

  const toggleActive = useCallback(async (promptId: string) => {
    try {
      const currentPrompt = systemPrompts.find(p => p.id === promptId);
      if (!currentPrompt) {
        throw new Error('システムプロンプトが見つかりません');
      }

      await editPrompt(promptId, { isActive: !currentPrompt.isActive });
    } catch (error) {
      console.error('システムプロンプト状態変更エラー:', error);
      throw error;
    }
  }, [systemPrompts, editPrompt]);

  return {
    systemPrompts,
    isLoading,
    fetchData,
    addPrompt,
    editPrompt,
    deletePrompt,
    toggleActive
  };
} 