'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, ArchiveBoxIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import SubjectExamTypeFlow from '@/components/common/SubjectExamTypeFlow';
import PromptUploadModal from './PromptUploadModal';
import PromptEditModal from './PromptEditModal';
import PromptDetailModal from './PromptDetailModal';
import SystemPromptModal from './SystemPromptModal';

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

interface SubjectDefinition {
  subjectId: string;
  subjectName: string;
  examType: 'mock' | 'past';
  tasks: TaskRow[];
}

interface DeletedSubject {
  subjectId: string;
  subjectName: string;
  examType: string;
  deletedAt: string;
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

interface SystemPrompt {
  id: string;
  subjectId: string;
  name: string;
  content: string;
  applicableTasks: string[];
  priority: number;
  isActive: boolean;
  maxCount: number;
  createdAt: string;
  updatedAt: string;
}

// プロンプト管理との連携用イベント
declare global {
  interface WindowEventMap {
    'taskDefinitionsUpdated': CustomEvent<{
      subjectId: string;
      examType: string;
      tasks: TaskRow[];
    }>;
    'subjectsUpdated': CustomEvent<{
      subjects: SubjectDefinition[];
    }>;
  }
}

export default function TaskDevelopment({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<'flow' | 'edit' | 'trash'>('flow');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<'mock' | 'past' | null>(null);
  const [subjects, setSubjects] = useState<SubjectDefinition[]>([]);
  const [deletedSubjects, setDeletedSubjects] = useState<DeletedSubject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [selectedDeletedSubject, setSelectedDeletedSubject] = useState<DeletedSubject | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  // プロンプト管理用の状態
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ taskId: string; fileType: string; taskName: string } | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<{ taskId: string; fileType: string; taskName: string } | null>(null);
  const [editingPromptUpload, setEditingPromptUpload] = useState<PromptUpload | null>(null);
  const [editingSystemPrompt, setEditingSystemPrompt] = useState<SystemPrompt | null>(null);
  const [promptUploads, setPromptUploads] = useState<PromptUpload[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [isLoadingSystemPrompts, setIsLoadingSystemPrompts] = useState(true);

  // 科目一覧を取得
  useEffect(() => {
    fetchSubjects();
    fetchDeletedSubjects();
    fetchUserRole();
  }, []);

  // プロンプトアップロードを取得
  const fetchPromptUploads = async () => {
    if (!selectedSubject) return;
    
    try {
      setIsLoadingUploads(true);
      const response = await fetch(`/api/prompts/upload?subjectId=${selectedSubject}`);
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

  // システムプロンプトを取得
  const fetchSystemPrompts = async () => {
    if (!selectedSubject) return;
    
    try {
      setIsLoadingSystemPrompts(true);
      const response = await fetch(`/api/prompts/system?subjectId=${selectedSubject}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'システムプロンプトの取得に失敗しました');
      }
      
      setSystemPrompts(data.systemPrompts || []);
    } catch (error) {
      console.error('システムプロンプト取得エラー:', error);
    } finally {
      setIsLoadingSystemPrompts(false);
    }
  };

  // 選択された科目が変更された時にプロンプトアップロードとシステムプロンプトを取得
  useEffect(() => {
    if (selectedSubject && currentView === 'edit') {
      fetchPromptUploads();
      fetchSystemPrompts();
    }
  }, [selectedSubject, currentView]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.user?.role || '');
      }
    } catch (error) {
      console.error('ユーザー権限の取得に失敗しました:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/tasks/subjects');
      if (response.ok) {
        const data = await response.json();
        // 各科目に空のタスク配列を初期化
        const subjectsWithTasks = data.map((subject: any) => ({
          ...subject,
          examType: subject.examType || 'mock',
          tasks: []
        }));
        setSubjects(subjectsWithTasks);
      }
    } catch (error) {
      console.error('科目一覧の取得に失敗しました:', error);
    }
  };

  const fetchDeletedSubjects = async () => {
    try {
      const response = await fetch('/api/tasks/subjects/deleted');
      if (response.ok) {
        const data = await response.json();
        setDeletedSubjects(data);
      }
    } catch (error) {
      console.error('削除済み科目一覧の取得に失敗しました:', error);
    }
  };

  // 科目を削除
  const deleteSubject = async (subjectId: string) => {
    const subjectName = getSubjectName(subjectId);
    
    try {
      const response = await fetch(`/api/tasks/subjects?subjectId=${subjectId}&action=soft_delete`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage(`「${subjectName}」を削除しました。ゴミ箱で復元できます。`);
        fetchSubjects();
        fetchDeletedSubjects();
        
        // 削除した科目が現在選択されている場合は、フロー画面に戻る
        if (selectedSubject === subjectId) {
          setCurrentView('flow');
          setSelectedSubject('');
          setSelectedExamType(null);
        }
      } else {
        setMessage('科目の削除に失敗しました');
      }
    } catch (error) {
      console.error('科目削除エラー:', error);
      setMessage('科目の削除に失敗しました');
    }
  };

  // 科目を復元
  const restoreSubject = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/tasks/subjects?subjectId=${subjectId}&action=restore`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('科目を復元しました');
        fetchSubjects();
        fetchDeletedSubjects();
        setShowTrashModal(false);
        setSelectedDeletedSubject(null);
      } else {
        setMessage('科目の復元に失敗しました');
      }
    } catch (error) {
      console.error('科目復元エラー:', error);
      setMessage('科目の復元に失敗しました');
    }
  };

  // 科目を完全削除
  const hardDeleteSubject = async (subjectId: string) => {
    if (!confirm('この科目を完全に削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/subjects?subjectId=${subjectId}&action=hard_delete`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('科目を完全に削除しました');
        fetchDeletedSubjects();
        setShowTrashModal(false);
        setSelectedDeletedSubject(null);
      } else {
        setMessage('科目の完全削除に失敗しました');
      }
    } catch (error) {
      console.error('科目完全削除エラー:', error);
      setMessage('科目の完全削除に失敗しました');
    }
  };

  // タスク編集画面に遷移
  const handleTaskEdit = (subjectId: string, examType: 'mock' | 'past') => {
    setSelectedSubject(subjectId);
    setSelectedExamType(examType);
    setCurrentView('edit');
    loadTasksForEdit(subjectId, examType);
  };

  // SubjectExamTypeFlowからのタスク選択処理
  const handleTaskSelect = (subjectId: string, fileType: string) => {
    // タスク選択時に編集画面に遷移
    const subject = subjects.find(s => s.subjectId === subjectId);
    if (subject) {
      // fileTypeが'mock'または'past'の場合はそのまま使用、そうでなければ科目のデフォルト試験種を使用
      const examType = (fileType === 'mock' || fileType === 'past') ? fileType : subject.examType;
      handleTaskEdit(subjectId, examType);
    }
  };

  // タスク編集用のデータを読み込み
  const loadTasksForEdit = async (subjectId: string, examType: 'mock' | 'past') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${subjectId}?examType=${examType}`);
      if (response.ok) {
        const data = await response.json();
        const tasks = convertToTableFormat(data.files || []);
        
        // タスクが空の場合はデフォルトタスクを追加
        let finalTasks = tasks;
        if (tasks.length === 0) {
          finalTasks = [{
            id: Date.now().toString(),
            taskId: '1',
            remark: '',
            description: '',
            problem: '',
            answer: '',
            explanation: '',
            scoring: '',
            isEditing: true
          }];
        }
        
        const updatedSubjects = subjects.map(subject => 
          subject.subjectId === subjectId 
            ? { ...subject, examType, tasks: finalTasks } 
            : subject
        );
        setSubjects(updatedSubjects);
      } else {
        // エラーの場合もデフォルトタスクを追加
        const defaultTask = {
          id: Date.now().toString(),
          taskId: '1',
          remark: '',
          description: '',
          problem: '',
          answer: '',
          explanation: '',
          scoring: '',
          isEditing: true
        };
        
        const updatedSubjects = subjects.map(subject => 
          subject.subjectId === subjectId 
            ? { ...subject, examType, tasks: [defaultTask] } 
            : subject
        );
        setSubjects(updatedSubjects);
      }
    } catch (error) {
      console.error('タスク定義の取得に失敗しました:', error);
      // エラーの場合もデフォルトタスクを追加
      const defaultTask = {
        id: Date.now().toString(),
        taskId: '1',
        remark: '',
        description: '',
        problem: '',
        answer: '',
        explanation: '',
        scoring: '',
        isEditing: true
      };
      
      const updatedSubjects = subjects.map(subject => 
        subject.subjectId === subjectId 
          ? { ...subject, examType, tasks: [defaultTask] } 
          : subject
      );
      setSubjects(updatedSubjects);
    } finally {
      setIsLoading(false);
    }
  };

  // データベースの形式から表形式に変換
  const convertToTableFormat = (files: any[]): TaskRow[] => {
    const taskMap = new Map<string, TaskRow>();
    
    files.forEach(file => {
      if (file.tasks && Array.isArray(file.tasks)) {
        file.tasks.forEach((task: any) => {
          const key = task.taskId;
          if (!taskMap.has(key)) {
            taskMap.set(key, {
              id: task.id,
              taskId: task.taskId,
              remark: task.remark || '',
              description: task.description,
              problem: '',
              answer: '',
              explanation: '',
              scoring: ''
            });
          }
          
          const taskRow = taskMap.get(key)!;
          switch (file.fileType) {
            case 'problem':
              taskRow.problem = task.description;
              break;
            case 'answer':
              taskRow.answer = task.description;
              break;
            case 'explanation':
              taskRow.explanation = task.description;
              break;
            case 'scoring':
              taskRow.scoring = task.description;
              break;
          }
        });
      }
    });
    
    return Array.from(taskMap.values()).sort((a, b) => parseInt(a.taskId) - parseInt(b.taskId));
  };

  // 表形式からデータベース形式に変換
  const convertToDatabaseFormat = (tasks: TaskRow[]) => {
    const files: any[] = [
      { fileType: 'problem', fileName: `${getSubjectName(selectedSubject)}_${selectedExamType === 'mock' ? '模試' : '過去問演習講座'}_問題用紙`, tasks: [] },
      { fileType: 'answer', fileName: `${getSubjectName(selectedSubject)}_${selectedExamType === 'mock' ? '模試' : '過去問演習講座'}_解答用紙`, tasks: [] },
      { fileType: 'explanation', fileName: `${getSubjectName(selectedSubject)}_${selectedExamType === 'mock' ? '模試' : '過去問演習講座'}_解答解説`, tasks: [] },
      { fileType: 'scoring', fileName: `${getSubjectName(selectedSubject)}_${selectedExamType === 'mock' ? '模試' : '過去問演習講座'}_採点基準`, tasks: [] }
    ];

    tasks.forEach(task => {
      if (task.problem) {
        files[0].tasks.push({
          id: task.id,
          taskId: task.taskId,
          remark: task.remark,
          taskName: task.remark,
          description: task.problem
        });
      }
      if (task.answer) {
        files[1].tasks.push({
          id: task.id,
          taskId: task.taskId,
          remark: task.remark,
          taskName: task.remark,
          description: task.answer
        });
      }
      if (task.explanation) {
        files[2].tasks.push({
          id: task.id,
          taskId: task.taskId,
          remark: task.remark,
          taskName: task.remark,
          description: task.explanation
        });
      }
      if (task.scoring) {
        files[3].tasks.push({
          id: task.id,
          taskId: task.taskId,
          remark: task.remark,
          taskName: task.remark,
          description: task.scoring
        });
      }
    });

    return files;
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.subjectId === subjectId);
    return subject ? subject.subjectName : '';
  };

  // プロンプト管理に変更を通知
  const notifyPromptManagement = (tasks: TaskRow[], examType: string) => {
    const event = new CustomEvent('taskDefinitionsUpdated', {
      detail: {
        subjectId: selectedSubject,
        examType: examType,
        tasks: tasks
      }
    });
    window.dispatchEvent(event);
  };

  // 新しいタスクを追加（自動ナンバリング）
  const addTask = () => {
    const selectedSubjectData = subjects.find(s => s.subjectId === selectedSubject);
    const nextTaskId = selectedSubjectData ? (selectedSubjectData.tasks.length + 1).toString() : '1';
    
    const newTask: TaskRow = {
      id: Date.now().toString(),
      taskId: nextTaskId,
      remark: '',
      description: '',
      problem: '',
      answer: '',
      explanation: '',
      scoring: '',
      isEditing: true
    };

    const updatedSubjects = subjects.map(subject => 
      subject.subjectId === selectedSubject 
        ? { ...subject, tasks: [...subject.tasks, newTask] }
        : subject
    );
    
    setSubjects(updatedSubjects);
    
    // プロンプト管理に変更を通知
    const updatedTasks = updatedSubjects.find(s => s.subjectId === selectedSubject)?.tasks || [];
    notifyPromptManagement(updatedTasks, selectedExamType || 'mock');
  };

  // タスクを削除
  const removeTask = (taskIndex: number) => {
    const updatedSubjects = subjects.map(subject => 
      subject.subjectId === selectedSubject 
        ? { ...subject, tasks: subject.tasks.filter((_, index) => index !== taskIndex) }
        : subject
    );
    
    setSubjects(updatedSubjects);
    
    // プロンプト管理に変更を通知
    const updatedTasks = updatedSubjects.find(s => s.subjectId === selectedSubject)?.tasks || [];
    notifyPromptManagement(updatedTasks, selectedExamType || 'mock');
  };

  // タスクの編集を開始
  const startEditTask = (taskIndex: number) => {
    setSubjects(prev => prev.map(subject => 
      subject.subjectId === selectedSubject 
        ? {
            ...subject,
            tasks: subject.tasks.map((task, index) => 
              index === taskIndex ? { ...task, isEditing: true } : task
            )
          }
        : subject
    ));
  };

  const handleEditButtonClick = (taskIndex: number) => {
    const action = prompt('編集または削除を選択してください:\n1: 編集\n2: 削除\n\n番号を入力してください:');
    
    if (action === '1') {
      startEditTask(taskIndex);
    } else if (action === '2') {
      if (confirm('このタスクを削除しますか？')) {
        removeTask(taskIndex);
      }
    }
  };

  // タスクの編集を保存
  const saveTask = (taskIndex: number) => {
    const updatedSubjects = subjects.map(subject => 
      subject.subjectId === selectedSubject 
        ? {
            ...subject,
            tasks: subject.tasks.map((task, index) => 
              index === taskIndex ? { ...task, isEditing: false } : task
            )
          }
        : subject
    );
    
    setSubjects(updatedSubjects);
    
    // プロンプト管理に変更を通知
    const updatedTasks = updatedSubjects.find(s => s.subjectId === selectedSubject)?.tasks || [];
    notifyPromptManagement(updatedTasks, selectedExamType || 'mock');
  };

  // タスクの編集をキャンセル
  const cancelEditTask = (taskIndex: number) => {
    setSubjects(prev => prev.map(subject => 
      subject.subjectId === selectedSubject 
        ? {
            ...subject,
            tasks: subject.tasks.map((task, index) => 
              index === taskIndex ? { ...task, isEditing: false } : task
            )
          }
        : subject
    ));
  };

  // タスクの値を更新
  const updateTask = (taskIndex: number, field: keyof TaskRow, value: any) => {
    const updatedSubjects = subjects.map(subject => 
      subject.subjectId === selectedSubject 
        ? {
            ...subject,
            tasks: subject.tasks.map((task, index) => 
              index === taskIndex ? { ...task, [field]: value } : task
            )
          }
        : subject
    );
    
    setSubjects(updatedSubjects);
    
    // プロンプト管理に変更を通知
    const updatedTasks = updatedSubjects.find(s => s.subjectId === selectedSubject)?.tasks || [];
    notifyPromptManagement(updatedTasks, selectedExamType || 'mock');
  };

  // タスク定義を保存
  const saveTaskDefinitions = async () => {
    if (!selectedSubject || !selectedExamType) return;

    setIsLoading(true);
    setMessage('');

    try {
      const subject = subjects.find(s => s.subjectId === selectedSubject);
      if (!subject) return;

      const files = convertToDatabaseFormat(subject.tasks);

      const response = await fetch(`/api/tasks/${selectedSubject}?examType=${selectedExamType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),
      });

      if (response.ok) {
        setMessage('タスク定義を保存しました');
        // 保存成功時にもプロンプト管理に通知
        notifyPromptManagement(subject.tasks, selectedExamType);
      } else {
        setMessage('タスク定義の保存に失敗しました');
      }
    } catch (error) {
      console.error('タスク定義の保存に失敗しました:', error);
      setMessage('タスク定義の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // プロンプト管理機能
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
      setMessage('プロンプトが正常にアップロードされました');
    } catch (error) {
      console.error('プロンプトアップロードエラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'プロンプトのアップロードに失敗しました';
      setMessage('プロンプトのアップロードに失敗しました: ' + errorMessage);
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
      setMessage('プロンプトが正常に更新されました');
    } catch (error) {
      console.error('プロンプト更新エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'プロンプトの更新に失敗しました';
      setMessage('プロンプトの更新に失敗しました: ' + errorMessage);
    }
  };

  const handleDeletePromptUpload = async (promptId?: string) => {
    try {
      // 削除後に一覧を再取得
      await fetchPromptUploads();
      setShowEditModal(false);
      setShowDetailModal(false);
      setEditingPromptUpload(null);
      
      // 成功メッセージを表示
      setMessage('プロンプトが正常に削除されました');
    } catch (error) {
      console.error('プロンプト削除エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'プロンプトの削除に失敗しました';
      setMessage('プロンプトの削除に失敗しました: ' + errorMessage);
    }
  };

  // システムプロンプト管理機能
  const handleSaveSystemPrompt = async (prompt: Omit<SystemPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const url = editingSystemPrompt 
        ? `/api/prompts/system/${editingSystemPrompt.id}`
        : '/api/prompts/system';
      
      const method = editingSystemPrompt ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'システムプロンプトの保存に失敗しました');
      }

      // 保存後に一覧を再取得
      await fetchSystemPrompts();
      setShowSystemPromptModal(false);
      setEditingSystemPrompt(null);
      
      // 成功メッセージを表示
      setMessage(editingSystemPrompt ? 'システムプロンプトが正常に更新されました' : 'システムプロンプトが正常に追加されました');
    } catch (error) {
      console.error('システムプロンプト保存エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'システムプロンプトの保存に失敗しました';
      setMessage('システムプロンプトの保存に失敗しました: ' + errorMessage);
    }
  };

  const handleEditSystemPrompt = (prompt: SystemPrompt) => {
    setEditingSystemPrompt(prompt);
    setShowSystemPromptModal(true);
  };

  const handleDeleteSystemPrompt = async (promptId: string) => {
    if (!confirm('このシステムプロンプトを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/system/${promptId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'システムプロンプトの削除に失敗しました');
      }

      // 削除後に一覧を再取得
      await fetchSystemPrompts();
      
      // 成功メッセージを表示
      setMessage('システムプロンプトが正常に削除されました');
    } catch (error) {
      console.error('システムプロンプト削除エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'システムプロンプトの削除に失敗しました';
      setMessage('システムプロンプトの削除に失敗しました: ' + errorMessage);
    }
  };

  const handleToggleSystemPromptActive = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/system/${promptId}/toggle`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'システムプロンプトの状態変更に失敗しました');
      }

      // 状態変更後に一覧を再取得
      await fetchSystemPrompts();
    } catch (error) {
      console.error('システムプロンプト状態変更エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'システムプロンプトの状態変更に失敗しました';
      setMessage('システムプロンプトの状態変更に失敗しました: ' + errorMessage);
    }
  };

  // 特定のタスクとファイルタイプのアップロードを取得
  const getUploadForTask = (taskId: string, fileType: string) => {
    return promptUploads.find(u => 
      u.subjectId === selectedSubject && 
      u.taskId === taskId && 
      u.fileType === fileType
    );
  };

  // セルクリック時の処理
  const handleCellClick = (taskId: string, fileType: string, taskName: string) => {
    // プロンプト詳細モーダルを開く
    setSelectedDetailTask({
      taskId: taskId,
      fileType: fileType,
      taskName: taskName
    });
    setShowDetailModal(true);
  };

  const selectedSubjectData = subjects.find(s => s.subjectId === selectedSubject);

  // フロー画面（科目選択→試験種選択→タスク表示）
  if (currentView === 'flow') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">タスク開発</h1>
            <p className="text-gray-600">科目ごとのタスク定義を表形式で作成・編集できます</p>
          </div>
          <div className="flex space-x-2">
            {(userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <button
                onClick={() => setCurrentView('trash')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              >
                <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                ゴミ箱 ({deletedSubjects.length})
              </button>
            )}
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              戻る
            </button>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('失敗') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <SubjectExamTypeFlow
            mode="development"
            onBack={onBack}
            onTaskSelect={handleTaskSelect}
            onDeleteSubject={deleteSubject}
            userRole={userRole}
          />
        </div>
      </div>
    );
  }

  // ゴミ箱画面
  if (currentView === 'trash') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ゴミ箱</h1>
            <p className="text-gray-600">削除された科目の復元または完全削除</p>
          </div>
          <button
            onClick={() => setCurrentView('flow')}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            戻る
          </button>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('失敗') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}

        {deletedSubjects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🗑️</div>
            <p className="text-gray-500">削除された科目はありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      科目名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      試験種
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      削除日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedSubjects.map((subject) => (
                    <tr key={subject.subjectId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subject.examType === 'mock' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {subject.examType === 'mock' ? '模試' : '過去問演習講座'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(subject.deletedAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => restoreSubject(subject.subjectId)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              復元
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDeletedSubject(subject);
                                setShowTrashModal(true);
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              完全削除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 完全削除確認モーダル */}
        {showTrashModal && selectedDeletedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">完全削除の確認</h3>
              <p className="text-gray-600 mb-4">
                「{selectedDeletedSubject.subjectName}」を完全に削除しますか？
              </p>
              <p className="text-sm text-red-600 mb-6">
                この操作は取り消せません。科目と関連するすべてのデータが永続的に削除されます。
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowTrashModal(false);
                    setSelectedDeletedSubject(null);
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
                {(userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                  <button
                    onClick={() => hardDeleteSubject(selectedDeletedSubject.subjectId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    完全削除
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // タスク編集画面
  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク開発</h1>
          <p className="text-gray-600">
            {getSubjectName(selectedSubject)} - {selectedExamType === 'mock' ? '模試' : '過去問演習講座'}
          </p>
          <div className="mt-2 text-sm text-blue-600">
            💡 各セルをクリックしてプロンプトの詳細表示・編集・アップロードができます
          </div>
          <div className="mt-2 text-sm text-green-600">
            📝 システムプロンプト: {systemPrompts.length}/3
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingSystemPrompt(null);
              setShowSystemPromptModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            システムプロンプト管理
          </button>
          {(userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
            <button
              onClick={() => deleteSubject(selectedSubject)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              科目削除
            </button>
          )}
          <button
            onClick={() => {
              setCurrentView('flow');
              setSelectedSubject('');
              setSelectedExamType(null);
            }}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            戻る
          </button>
        </div>
      </div>

      {/* メッセージ */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('失敗') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {selectedSubject && selectedSubjectData && (
        <div className="space-y-6">
          {/* システムプロンプト一覧 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              システムプロンプト一覧 ({systemPrompts.length}/3)
            </h3>
            {systemPrompts.length > 0 ? (
              <div className="space-y-4">
                {systemPrompts.map((prompt) => (
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
                <button
                  onClick={() => {
                    setEditingSystemPrompt(null);
                    setShowSystemPromptModal(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  最初のシステムプロンプトを追加
                </button>
              </div>
            )}
          </div>

          {/* タスク表 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タスクID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      備考
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      問題用紙
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      解答用紙
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      解答解説
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      採点基準
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      編集
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(selectedSubjectData.tasks || []).map((task, taskIndex) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      {task.isEditing ? (
                        // 編集モード
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.taskId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={task.remark}
                              onChange={(e) => updateTask(taskIndex, 'remark', e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="備考"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={task.problem}
                              onChange={(e) => updateTask(taskIndex, 'problem', e.target.value)}
                              className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                              rows={2}
                              placeholder="問題用紙の説明"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={task.answer}
                              onChange={(e) => updateTask(taskIndex, 'answer', e.target.value)}
                              className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                              rows={2}
                              placeholder="解答用紙の説明"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={task.explanation}
                              onChange={(e) => updateTask(taskIndex, 'explanation', e.target.value)}
                              className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                              rows={2}
                              placeholder="解答解説の説明"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={task.scoring}
                              onChange={(e) => updateTask(taskIndex, 'scoring', e.target.value)}
                              className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                              rows={2}
                              placeholder="採点基準の説明"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveTask(taskIndex)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => cancelEditTask(taskIndex)}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // 表示モード
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.taskId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.remark || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="cursor-pointer hover:bg-blue-50 p-2 rounded border border-gray-200" onClick={() => handleCellClick(task.taskId, 'problem', task.remark)}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700">📄 問題用紙</span>
                                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {task.problem || '説明なし'}
                              </div>
                              {getUploadForTask(task.taskId, 'problem') ? (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ プロンプト設定済み
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ⚠️ プロンプト未設定
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="cursor-pointer hover:bg-blue-50 p-2 rounded border border-gray-200" onClick={() => handleCellClick(task.taskId, 'answer', task.remark)}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700">✏️ 解答用紙</span>
                                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {task.answer || '説明なし'}
                              </div>
                              {getUploadForTask(task.taskId, 'answer') ? (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ プロンプト設定済み
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ⚠️ プロンプト未設定
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="cursor-pointer hover:bg-blue-50 p-2 rounded border border-gray-200" onClick={() => handleCellClick(task.taskId, 'explanation', task.remark)}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700">📖 解答解説</span>
                                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {task.explanation || '説明なし'}
                              </div>
                              {getUploadForTask(task.taskId, 'explanation') ? (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ プロンプト設定済み
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ⚠️ プロンプト未設定
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="cursor-pointer hover:bg-blue-50 p-2 rounded border border-gray-200" onClick={() => handleCellClick(task.taskId, 'scoring', task.remark)}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700">📊 採点基準</span>
                                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {task.scoring || '説明なし'}
                              </div>
                              {getUploadForTask(task.taskId, 'scoring') ? (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ プロンプト設定済み
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ⚠️ プロンプト未設定
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditButtonClick(taskIndex)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                              >
                                <PencilIcon className="w-4 h-4 mr-1" />
                                編集
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* タスク追加ボタン */}
          <div className="flex justify-between items-center">
            <button
              onClick={addTask}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              タスクを追加
            </button>

            {/* 保存ボタン */}
            <button
              onClick={saveTaskDefinitions}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : 'タスク定義を保存'}
            </button>
          </div>
        </div>
      )}

      {/* プロンプトアップロードモーダル */}
      {showUploadModal && selectedTask && (
        <PromptUploadModal
          subjectId={selectedSubject}
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

      {/* プロンプト詳細モーダル */}
      {showDetailModal && selectedDetailTask && (
        <PromptDetailModal
          taskId={selectedDetailTask.taskId}
          taskName={selectedDetailTask.taskName}
          fileType={selectedDetailTask.fileType}
          promptUploads={promptUploads}
          onEdit={(prompt) => {
            setEditingPromptUpload(prompt);
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
          onDelete={handleDeletePromptUpload}
          onUpload={(taskId, fileType, taskName) => {
            setSelectedTask({ taskId, fileType, taskName });
            setShowDetailModal(false);
            setShowUploadModal(true);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDetailTask(null);
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

      {/* システムプロンプト追加・編集モーダル */}
      {showSystemPromptModal && (
        <SystemPromptModal
          subjectId={selectedSubject}
          editingPrompt={editingSystemPrompt}
          onSave={handleSaveSystemPrompt}
          onClose={() => {
            setShowSystemPromptModal(false);
            setEditingSystemPrompt(null);
          }}
        />
      )}
    </div>
  );
} 