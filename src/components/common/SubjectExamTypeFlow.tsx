'use client';

import { useState, useEffect } from 'react';

interface Subject {
  subjectId: string;
  subjectName: string;
  examType: 'mock' | 'past';
}

interface TaskRow {
  id: string;
  taskId: string;
  remark: string;
  description: string;
  problem: string;
  answer: string;
  explanation: string;
  scoring: string;
}

interface SubjectExamTypeFlowProps {
  mode: 'work' | 'prompt' | 'development';
  onBack: () => void;
  onTaskSelect?: (taskId: string, fileType: string) => void;
  onWorkStart?: (subjectId: string, examType: 'mock' | 'past') => void;
  onTaskEdit?: (tasks: TaskRow[]) => void;
  onDeleteSubject?: (subjectId: string) => void;
  userRole?: string;
}

export default function SubjectExamTypeFlow({ 
  mode, 
  onBack, 
  onTaskSelect, 
  onWorkStart,
  onTaskEdit,
  onDeleteSubject,
  userRole
}: SubjectExamTypeFlowProps) {
  const [currentView, setCurrentView] = useState<'subjects' | 'examType' | 'tasks'>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<'mock' | 'past' | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectExamType, setNewSubjectExamType] = useState<'mock' | 'past'>('mock');
  const [message, setMessage] = useState('');

  // 科目一覧を取得
  useEffect(() => {
    fetchSubjects();
  }, []);

  // 科目追加時のイベントリスナー
  useEffect(() => {
    const handleSubjectsUpdated = (event: CustomEvent<{ subjects: Subject[] }>) => {
      setSubjects(event.detail.subjects);
    };

    window.addEventListener('subjectsUpdated', handleSubjectsUpdated as EventListener);
    
    // ローカルストレージから復元を試行
    try {
      const storedSubjects = localStorage.getItem('subjects');
      if (storedSubjects) {
        const parsedSubjects = JSON.parse(storedSubjects);
        setSubjects(parsedSubjects);
      }
    } catch (error) {
      console.warn('ローカルストレージからの復元に失敗しました:', error);
    }
    
    return () => {
      window.removeEventListener('subjectsUpdated', handleSubjectsUpdated as EventListener);
    };
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        setError('科目一覧の取得に失敗しました');
      }
    } catch (error) {
      console.error('科目一覧の取得に失敗しました:', error);
      setError('科目一覧の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 新しい科目を追加
  const addNewSubject = async () => {
    if (!newSubjectName.trim()) return;

    try {
      const response = await fetch('/api/tasks/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectName: newSubjectName.trim(),
          examType: 'mock' // デフォルトで模試を設定
        }),
      });

      if (response.ok) {
        const newSubject = await response.json();
        const updatedSubjects = [...subjects, newSubject];
        setSubjects(updatedSubjects);
        setNewSubjectName('');
        setNewSubjectExamType('mock');
        setShowAddSubjectModal(false);
        
        // 他の画面に科目追加を通知
        notifySubjectsUpdated(updatedSubjects);
        
        setMessage('科目を追加しました');
        
        // 成功メッセージを3秒後に消去
        setTimeout(() => {
          setMessage('');
        }, 3000);

        // 科目追加後、自動的にその科目のタスク編集画面に遷移
        if (mode === 'development') {
          setSelectedSubject(newSubject);
          setSelectedExamType('mock');
          setCurrentView('tasks');
          await fetchTasks(newSubject.subjectId, 'mock');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || '科目の追加に失敗しました');
      }
    } catch (error) {
      console.error('科目追加エラー:', error);
      setMessage('科目の追加に失敗しました');
    }
  };

  // 他の画面に科目追加を通知
  const notifySubjectsUpdated = (updatedSubjects: Subject[]) => {
    // カスタムイベントで通知
    const event = new CustomEvent('subjectsUpdated', {
      detail: {
        subjects: updatedSubjects
      }
    });
    window.dispatchEvent(event);
    
    // ローカルストレージにも保存して永続化
    try {
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    } catch (error) {
      console.warn('ローカルストレージへの保存に失敗しました:', error);
    }
    
    // 複数の方法で通知を試行
    setTimeout(() => {
      window.dispatchEvent(event);
    }, 100);
    
    setTimeout(() => {
      window.dispatchEvent(event);
    }, 500);
  };

  const fetchTasks = async (subjectId: string, examType: 'mock' | 'past') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${subjectId}?examType=${examType}`);
      if (response.ok) {
        const data = await response.json();
        const taskRows = convertToTableFormat(data.files || []);
        setTasks(taskRows);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
      setTasks([]);
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

  // 科目名からアイコンを取得する関数
  const getSubjectIcon = (subjectName: string): string => {
    const iconMap: { [key: string]: string } = {
      '英語': '🇺🇸',
      '国語': '🇯🇵',
      '数学': '📐',
      '物理': '⚛️',
      '化学': '🧪',
      '生物': '🧬',
      '地学': '🌍',
      '世界史': '🌍',
      '日本史': '🗾',
      '地理': '🗺️',
      '政治経済': '🏛️',
      '倫理': '🤔',
      '現代社会': '📰'
    };
    
    return iconMap[subjectName] || '📚';
  };

  // 科目選択時の処理
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('examType');
  };

  // 試験種選択時の処理
  const handleExamTypeSelect = async (examType: 'mock' | 'past') => {
    if (!selectedSubject) return;
    
    setSelectedExamType(examType);
    setCurrentView('tasks');
    await fetchTasks(selectedSubject.subjectId, examType);
  };

  // タスク選択時の処理
  const handleTaskSelect = (taskId: string, fileType: string) => {
    if (onTaskSelect) {
      // プロンプト管理モードの場合は、科目IDと試験種を渡す
      if (mode === 'prompt' && selectedSubject && selectedExamType) {
        onTaskSelect(selectedSubject.subjectId, selectedExamType);
      } 
      // タスク開発モードの場合は、科目IDと試験種を渡す
      else if (mode === 'development' && selectedSubject && selectedExamType) {
        onTaskSelect(selectedSubject.subjectId, selectedExamType);
      } 
      // 作業モードの場合は、タスクIDとファイルタイプを渡す
      else {
        onTaskSelect(taskId, fileType);
      }
    }
  };

  // 作業開始時の処理
  const handleWorkStart = () => {
    if (onWorkStart && selectedSubject && selectedExamType) {
      onWorkStart(selectedSubject.subjectId, selectedExamType);
    }
  };

  if (isLoading && currentView === 'subjects') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          戻る
        </button>
      </div>
    );
  }

  // 科目選択画面
  if (currentView === 'subjects') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'work' && '作業科目選択'}
            {mode === 'prompt' && 'プロンプト管理 - 科目選択'}
            {mode === 'development' && 'タスク開発 - 科目選択'}
          </h2>
          <div className="flex space-x-2">
            {mode === 'development' && (userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                科目追加
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
          <div className={`p-4 rounded-lg ${
            message.includes('失敗') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.subjectId}
              onClick={() => handleSubjectSelect(subject)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 relative group"
            >
              <div className="text-3xl mb-3">{getSubjectIcon(subject.subjectName)}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{subject.subjectName}</h3>
              <div className="mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  subject.examType === 'mock' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {subject.examType === 'mock' ? '模試' : '過去問演習講座'}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                {mode === 'work' && '品質チェック作業'}
                {mode === 'prompt' && 'プロンプト管理'}
                {mode === 'development' && 'タスク定義編集'}
              </p>
              
              {/* 削除ボタン（開発者権限のみ） */}
              {mode === 'development' && onDeleteSubject && (userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`「${subject.subjectName}」を削除しますか？\n削除した科目はゴミ箱に移動し、復元可能です。`)) {
                      onDeleteSubject(subject.subjectId);
                    }
                  }}
                  className="absolute top-2 right-2 p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                  title="科目を削除（ゴミ箱に移動）"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-500 mb-4">科目がありません</p>
            <p className="text-sm text-gray-400">
              {mode === 'development' ? 'タスク開発で科目を追加してください' : '開発者ツールで科目を追加してください'}
            </p>
          </div>
        )}

        {/* 科目追加モーダル */}
        {showAddSubjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新しい科目を追加</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  科目名
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="例: 物理、化学、生物..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addNewSubject()}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddSubjectModal(false);
                    setNewSubjectName('');
                    setNewSubjectExamType('mock');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={addNewSubject}
                  disabled={!newSubjectName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 試験種選択画面
  if (currentView === 'examType') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedSubject?.subjectName} - 試験種選択
            </h2>
            <p className="text-gray-600">
              {mode === 'work' && '品質チェック作業の試験種を選択'}
              {mode === 'prompt' && 'プロンプト管理の試験種を選択'}
              {mode === 'development' && 'タスク定義編集の試験種を選択'}
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentView('subjects');
              setSelectedSubject(null);
            }}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            戻る
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleExamTypeSelect('mock')}
            className="p-8 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">模試</h3>
            <p className="text-gray-600">模擬試験の品質チェック</p>
          </button>
          
          <button
            onClick={() => handleExamTypeSelect('past')}
            className="p-8 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-center"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">過去問演習講座</h3>
            <p className="text-gray-600">過去の入試問題の品質チェック</p>
          </button>
        </div>
      </div>
    );
  }

  // タスク一覧画面
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedSubject?.subjectName} - {selectedExamType === 'mock' ? '模試' : '過去問演習講座'}
          </h2>
          <p className="text-gray-600">
            {mode === 'work' && '品質チェック作業 - タスク選択'}
            {mode === 'prompt' && 'プロンプト管理 - タスク一覧'}
            {mode === 'development' && 'タスク定義編集'}
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentView('examType');
            setSelectedExamType(null);
          }}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          戻る
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">タスクを読み込み中...</p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4">
          {mode === 'work' && (
            <div className="flex justify-end">
              <button
                onClick={handleWorkStart}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                作業開始
              </button>
            </div>
          )}
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
                  {mode === 'development' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.taskId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.remark || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.problem || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.answer || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.explanation || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.scoring || '-'}
                    </td>
                    {mode === 'development' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTaskSelect(task.taskId, 'edit')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          編集
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 mb-4">タスクが定義されていません</p>
          <p className="text-sm text-gray-400 mb-6">
            表形式でタスクを追加してください
          </p>
          {mode === 'development' && selectedSubject && selectedExamType && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">タスク定義表</h3>
                <p className="text-sm text-gray-600">新しいタスクを追加してください</p>
              </div>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        1
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input
                          type="text"
                          placeholder="備考を入力"
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <textarea
                          placeholder="問題用紙の説明"
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <textarea
                          placeholder="解答用紙の説明"
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <textarea
                          placeholder="解答解説の説明"
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <textarea
                          placeholder="採点基準の説明"
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => handleTaskSelect('1', 'edit')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  タスク定義を開始
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 