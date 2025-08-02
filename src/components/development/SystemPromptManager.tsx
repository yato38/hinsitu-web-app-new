'use client';

import { useState, useEffect } from 'react';
import DevelopmentLayout from '@/components/DevelopmentLayout';
import { SystemPrompt } from '@/types/prompts';
import { getSubjectInfo } from '@/data/subjectTasks';
import { canAddSystemPrompt, allTaskIds, getTaskRemark } from '@/utils/development/taskUtils';
import SystemPromptModal from './SystemPromptModal';
import PromptUploadModal from './PromptUploadModal';
import PromptEditModal from './PromptEditModal';
import { useSystemPrompts } from '@/hooks/development/useSystemPrompts';

interface SystemPromptManagerProps {
  subjectId: string;
  onBack: () => void;
}

interface PromptUpload {
  id: string;
  subjectId: string;
  taskId: string;
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  fileName: string;
  fileContent: string;
  description?: string;
  version: string;
  isActive: boolean;
  uploadedAt: string;
  user: {
    name: string;
  };
}

// タスク開発からの変更を監視するためのインターフェース
interface TaskRow {
  id: string;
  taskId: string;
  remark: string;
  description: string;
  problem: string;
  answer: string;
  explanation: string;
  scoring: string;
  isEditing?: boolean;
}

// データベースから取得するタスク定義のインターフェース
interface TaskItem {
  id: string;
  taskId: string;
  taskName: string;
  description: string;
  remark: string;
}

interface FileTasks {
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  fileName: string;
  tasks: TaskItem[];
}

interface SubjectTasks {
  subjectId: string;
  subjectName: string;
  files: FileTasks[];
}

export default function SystemPromptManager({ 
  subjectId, 
  onBack 
}: SystemPromptManagerProps) {
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSystemPrompt, setEditingSystemPrompt] = useState<SystemPrompt | null>(null);
  const [editingPromptUpload, setEditingPromptUpload] = useState<PromptUpload | null>(null);
  const [selectedTask, setSelectedTask] = useState<{ taskId: string; fileType: string; taskName: string } | null>(null);
  const [promptUploads, setPromptUploads] = useState<PromptUpload[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  
  // タスク開発からの変更を監視するための状態
  const [currentTasks, setCurrentTasks] = useState<TaskRow[]>([]);
  const [taskDefinitionsUpdated, setTaskDefinitionsUpdated] = useState(false);
  
  // データベースから取得したタスク定義
  const [subjectTasks, setSubjectTasks] = useState<SubjectTasks | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const { systemPrompts, addPrompt, editPrompt, deletePrompt, toggleActive, fetchData } = useSystemPrompts();

  // subjectIdが変更された時にデータを取得
  useEffect(() => {
    if (subjectId) {
      fetchData(subjectId);
    }
  }, [subjectId, fetchData]);

  const subjectInfo = getSubjectInfo(subjectId);
  const subjectSystemPrompts = systemPrompts.filter(p => p.subjectId === subjectId);
  const systemPromptCount = subjectSystemPrompts.length;
  const canAdd = canAddSystemPrompt(subjectId, systemPromptCount);

  // データベースからタスク定義を取得
  useEffect(() => {
    const fetchTaskDefinitions = async () => {
      try {
        setIsLoadingTasks(true);
        
        const response = await fetch(`/api/tasks/${subjectId}`);
        if (response.ok) {
          const data = await response.json();
          setSubjectTasks({
            subjectId: data.subjectId || subjectId,
            subjectName: data.subjectName || getSubjectName(subjectId),
            files: data.files || []
          });
        } else {
          // レスポンスが失敗した場合は空のタスク定義を設定
          setSubjectTasks({
            subjectId: subjectId,
            subjectName: getSubjectName(subjectId),
            files: []
          });
        }
      } catch (error) {
        console.error('タスク定義の取得に失敗しました:', error);
        // エラー時は空のタスク定義を設定
        setSubjectTasks({
          subjectId: subjectId,
          subjectName: getSubjectName(subjectId),
          files: []
        });
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTaskDefinitions();
  }, [subjectId]);

  const getSubjectName = (subjectId: string) => {
    const subjectNames: { [key: string]: string } = {
      'english': '英語',
      'japanese': '国語',
      'math': '数学',
      'development': '開発'
    };
    return subjectNames[subjectId] || '不明';
  };

  // タスク開発からの変更を監視
  useEffect(() => {
    const handleTaskDefinitionsUpdated = (event: CustomEvent<{
      subjectId: string;
      tasks: TaskRow[];
    }>) => {
      if (event.detail.subjectId === subjectId) {
        setCurrentTasks(event.detail.tasks);
        setTaskDefinitionsUpdated(true);
        
        // 変更通知を表示
        console.log(`タスク定義が更新されました: ${event.detail.tasks.length}個のタスク`);
      }
    };

    window.addEventListener('taskDefinitionsUpdated', handleTaskDefinitionsUpdated as EventListener);

    return () => {
      window.removeEventListener('taskDefinitionsUpdated', handleTaskDefinitionsUpdated as EventListener);
    };
  }, [subjectId]);

  // プロンプトアップロードを取得
  const fetchPromptUploads = async () => {
    try {
      const response = await fetch(`/api/prompts/upload?subjectId=${subjectId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'プロンプトアップロードの取得に失敗しました');
      }
      
      setPromptUploads(data.promptUploads);
    } catch (error) {
      console.error('プロンプトアップロード取得エラー:', error);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  useEffect(() => {
    fetchPromptUploads();
  }, [subjectId]);

  // タスク定義が更新された時にプロンプトアップロードを再取得
  useEffect(() => {
    if (taskDefinitionsUpdated) {
      fetchPromptUploads();
      setTaskDefinitionsUpdated(false);
    }
  }, [taskDefinitionsUpdated]);

  const handleSaveSystemPrompt = async (prompt: Omit<SystemPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingSystemPrompt) {
        await editPrompt(editingSystemPrompt.id, prompt);
        setEditingSystemPrompt(null);
      } else {
        await addPrompt(prompt);
      }
      setShowSystemPromptModal(false);
    } catch (error) {
      console.error('システムプロンプト保存エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'システムプロンプトの保存に失敗しました';
      alert('システムプロンプトの保存に失敗しました: ' + errorMessage);
    }
  };

  const handleEditSystemPrompt = (prompt: SystemPrompt) => {
    setEditingSystemPrompt(prompt);
    setShowSystemPromptModal(true);
  };

  const handleDeleteSystemPrompt = async (promptId: string) => {
    if (confirm('このシステムプロンプトを削除しますか？')) {
      try {
        await deletePrompt(promptId);
      } catch (error) {
        console.error('システムプロンプト削除エラー:', error);
        const errorMessage = error instanceof Error ? error.message : 'システムプロンプトの削除に失敗しました';
        alert('システムプロンプトの削除に失敗しました: ' + errorMessage);
      }
    }
  };

  const handleToggleSystemPromptActive = async (promptId: string) => {
    try {
      await toggleActive(promptId);
    } catch (error) {
      console.error('システムプロンプト状態変更エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'システムプロンプトの状態変更に失敗しました';
      alert('システムプロンプトの状態変更に失敗しました: ' + errorMessage);
    }
  };

  const handleUploadPrompt = async (upload: any) => {
    try {
      // APIにプロンプトをアップロード
      const response = await fetch('/api/prompts/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'プロンプトのアップロードに失敗しました');
      }

      console.log('プロンプトアップロード成功:', data);
      
      // アップロード後に一覧を再取得
      await fetchPromptUploads();
      setShowUploadModal(false);
      
      // 成功メッセージを表示
      alert('プロンプトが正常にアップロードされました');
    } catch (error) {
      console.error('プロンプトアップロードエラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'プロンプトのアップロードに失敗しました';
      alert('プロンプトのアップロードに失敗しました: ' + errorMessage);
    }
  };

  const handleEditPromptUpload = (prompt: PromptUpload) => {
    setEditingPromptUpload(prompt);
    setShowEditModal(true);
  };

  const handleSavePromptUpload = async (updatedPrompt: PromptUpload) => {
    try {
      // 更新後に一覧を再取得
      await fetchPromptUploads();
      setShowEditModal(false);
      setEditingPromptUpload(null);
      
      // 成功メッセージを表示
      alert('プロンプトが正常に更新されました');
    } catch (error) {
      console.error('プロンプト更新エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'プロンプトの更新に失敗しました';
      alert('プロンプトの更新に失敗しました: ' + errorMessage);
    }
  };

  const handleDeletePromptUpload = async () => {
    try {
      // 削除後に一覧を再取得
      await fetchPromptUploads();
      setShowEditModal(false);
      setEditingPromptUpload(null);
      
      // 成功メッセージを表示
      alert('プロンプトが正常に削除されました');
    } catch (error) {
      console.error('プロンプト削除エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'プロンプトの削除に失敗しました';
      alert('プロンプトの削除に失敗しました: ' + errorMessage);
    }
  };

  // 特定のタスクとファイルタイプのアップロードを取得
  const getUploadForTask = (taskId: string, fileType: string) => {
    return promptUploads.find(u => 
      u.subjectId === subjectId && 
      u.taskId === taskId && 
      u.fileType === fileType
    );
  };

  // 現在のタスクから表示用のタスクIDリストを生成
  const getCurrentTaskIds = () => {
    if (currentTasks.length > 0) {
      return currentTasks.map(task => task.taskId);
    }
    // タスク開発からの変更がない場合は、データベースのタスク定義を使用
    if (subjectTasks && subjectTasks.files.length > 0) {
      const taskIds = new Set<string>();
      subjectTasks.files.forEach(file => {
        file.tasks.forEach(task => {
          taskIds.add(task.taskId);
        });
      });
      return Array.from(taskIds).sort((a, b) => parseInt(a) - parseInt(b));
    }
    // デフォルトのタスクIDリストを使用
    return allTaskIds;
  };

  // 現在のタスクから備考を取得
  const getCurrentTaskRemark = (taskId: string) => {
    const currentTask = currentTasks.find(task => task.taskId === taskId);
    if (currentTask) {
      return currentTask.remark;
    }
    // データベースのタスク定義から取得
    if (subjectTasks) {
      for (const file of subjectTasks.files) {
        const task = file.tasks.find(t => t.taskId === taskId);
        if (task) {
          return task.remark;
        }
      }
    }
    // 既存の備考を使用
    return getTaskRemark(taskId);
  };

  // 現在のタスクからファイルタイプ別のタスク情報を取得
  const getCurrentTaskForFileType = (taskId: string, fileType: string) => {
    // タスク開発からの変更を優先
    const currentTask = currentTasks.find(task => task.taskId === taskId);
    if (currentTask) {
      let description = '';
      let taskName = currentTask.remark;

      switch (fileType) {
        case 'problem':
          description = currentTask.problem;
          break;
        case 'answer':
          description = currentTask.answer;
          break;
        case 'explanation':
          description = currentTask.explanation;
          break;
        case 'scoring':
          description = currentTask.scoring;
          break;
      }

      return {
        id: currentTask.id,
        taskId: currentTask.taskId,
        name: taskName,
        description: description
      };
    }

    // データベースのタスク定義から取得
    if (subjectTasks) {
      const file = subjectTasks.files.find(f => f.fileType === fileType);
      if (file) {
        const task = file.tasks.find(t => t.taskId === taskId);
        if (task) {
          return {
            id: task.id,
            taskId: task.taskId,
            name: task.taskName || task.remark,
            description: task.description
          };
        }
      }
    }

    return null;
  };

  if (isLoadingTasks) {
    return (
      <DevelopmentLayout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">タスク定義を読み込み中...</p>
            </div>
          </div>
        </div>
      </DevelopmentLayout>
    );
  }

  return (
    <DevelopmentLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {subjectInfo.icon} {subjectInfo.name} - プロンプト管理
                </h2>
                <p className="text-gray-600">システムプロンプトとタスク別プロンプトの管理</p>
                <div className="mt-2 text-sm text-gray-500">
                  システムプロンプト: {systemPromptCount}/3
                </div>
                {currentTasks.length > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ タスク開発と連携中 ({currentTasks.length}個のタスク)
                  </div>
                )}
                {subjectTasks && subjectTasks.files.length > 0 && (
                  <div className="mt-2 text-sm text-blue-600">
                    ✓ データベースから取得 ({subjectTasks.files.reduce((acc, file) => acc + file.tasks.length, 0)}個のタスク)
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {canAdd && (
                  <button
                    onClick={() => {
                      setEditingSystemPrompt(null);
                      setShowSystemPromptModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    システムプロンプト追加
                  </button>
                )}
                <button
                  onClick={onBack}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  戻る
                </button>
              </div>
            </div>
          </div>

          {/* システムプロンプト一覧 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              システムプロンプト一覧 ({systemPromptCount}/3)
            </h3>
            {subjectSystemPrompts.length > 0 ? (
              <div className="space-y-4">
                {subjectSystemPrompts.map((prompt) => (
                  <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{prompt.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          prompt.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prompt.isActive ? 'アクティブ' : '非アクティブ'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          優先度: {prompt.priority}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleSystemPromptActive(prompt.id)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            prompt.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {prompt.isActive ? '非アクティブ化' : 'アクティブ化'}
                        </button>
                        <button
                          onClick={() => handleEditSystemPrompt(prompt)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteSystemPrompt(prompt.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{prompt.content}</p>
                    <div className="text-xs text-gray-500">
                      適用タスク: {prompt.applicableTasks.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">システムプロンプトがありません</p>
                {canAdd && (
                  <button
                    onClick={() => {
                      setEditingSystemPrompt(null);
                      setShowSystemPromptModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    最初のシステムプロンプトを追加
                  </button>
                )}
              </div>
            )}
          </div>

          {/* タスク選択テーブル（英語の場合のみ） */}
          {subjectId === 'english' && subjectTasks && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                タスク別プロンプト管理
              </h3>
              
              {isLoadingUploads ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900 bg-gray-100">
                          タスクID
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900 bg-gray-100">
                          備考
                        </th>
                        {subjectTasks.files.map(file => (
                          <th key={file.fileType} className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900 bg-gray-100">
                            <div className="flex items-center justify-center">
                              <span className="mr-2">
                                {file.fileType === 'problem' && '📄'}
                                {file.fileType === 'answer' && '✏️'}
                                {file.fileType === 'explanation' && '📖'}
                                {file.fileType === 'scoring' && '📊'}
                              </span>
                              {file.fileName}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentTaskIds().map(taskId => (
                        <tr key={taskId} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-blue-50">
                            {taskId}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-gray-50">
                            {getCurrentTaskRemark(taskId)}
                          </td>
                          {subjectTasks.files.map(file => {
                            const task = getCurrentTaskForFileType(taskId, file.fileType);
                            const upload = getUploadForTask(taskId, file.fileType);
                            
                            return (
                              <td key={file.fileType} className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                {task ? (
                                  <div className="text-center">
                                    <button
                                      onClick={() => {
                                        if (upload) {
                                          // アップロード済みの場合は編集モーダルを開く
                                          handleEditPromptUpload(upload);
                                        } else {
                                          // 未アップロードの場合はアップロードモーダルを開く
                                          setSelectedTask({
                                            taskId: task.id,
                                            fileType: file.fileType,
                                            taskName: task.name
                                          });
                                          setShowUploadModal(true);
                                        }
                                      }}
                                      className="text-blue-600 hover:text-blue-900 hover:underline block w-full mb-1"
                                    >
                                      {task.name}
                                    </button>
                                    {upload ? (
                                      <div className="space-y-1">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          ✓ アップロード済み
                                        </span>
                                        <div className="text-xs text-gray-500">
                                          <div>アップロード者: {upload.user.name}</div>
                                          <div>日時: {new Date(upload.uploadedAt).toLocaleDateString('ja-JP')}</div>
                                          <div>バージョン: {upload.version}</div>
                                          {upload.description && (
                                            <div className="mt-1 text-gray-600">
                                              {upload.description}
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => handleEditPromptUpload(upload)}
                                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                          編集
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        未アップロード
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-center block">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 凡例 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">凡例</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-2">📄</span>
                    <span>問題用紙</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✏️</span>
                    <span>解答用紙</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📖</span>
                    <span>解答解説</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📊</span>
                    <span>採点基準</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 国語・数学の場合は簡易表示 */}
          {(subjectId === 'japanese' || subjectId === 'math') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚧</div>
                <p className="text-gray-600 mb-4">
                  {subjectId === 'japanese' ? '国語' : '数学'}のプロンプト管理機能は現在開発中です。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* システムプロンプト追加・編集モーダル */}
        {showSystemPromptModal && (
          <SystemPromptModal
            subjectId={subjectId}
            editingPrompt={editingSystemPrompt}
            onSave={handleSaveSystemPrompt}
            onClose={() => {
              setShowSystemPromptModal(false);
              setEditingSystemPrompt(null);
            }}
          />
        )}

        {/* プロンプトアップロードモーダル */}
        {showUploadModal && selectedTask && (
          <PromptUploadModal
            subjectId={subjectId}
            taskId={selectedTask.taskId}
            fileType={selectedTask.fileType as any}
            taskName={selectedTask.taskName}
            fileName={`${selectedTask.taskId}_${selectedTask.fileType}.txt`}
            onUpload={handleUploadPrompt}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedTask(null);
            }}
          />
        )}

        {/* プロンプト編集モーダル */}
        {showEditModal && editingPromptUpload && (
          <PromptEditModal
            prompt={editingPromptUpload}
            onSave={handleSavePromptUpload}
            onClose={() => {
              setShowEditModal(false);
              setEditingPromptUpload(null);
            }}
          />
        )}
      </div>
    </DevelopmentLayout>
  );
} 