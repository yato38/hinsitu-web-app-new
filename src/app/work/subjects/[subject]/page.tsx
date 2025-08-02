'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TaskSelector from '@/features/work/components/TaskSelector';

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

export default function WorkSubjectPage() {
  const { data: session } = useSession();
  const params = useParams();
  const subjectId = params.subject as string;
  const [selectedType, setSelectedType] = useState<'past' | 'mock' | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 科目情報を取得
  useEffect(() => {
    if (session) {
      fetchSubjectInfo();
    }
  }, [session, subjectId]);

  // 試験種選択時にタスクを取得
  useEffect(() => {
    if (selectedType && subject) {
      fetchTasks(selectedType);
    }
  }, [selectedType, subject]);

  const fetchSubjectInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks/subjects');
      if (response.ok) {
        const subjects = await response.json();
        const foundSubject = subjects.find((s: Subject) => s.subjectId === subjectId);
        if (foundSubject) {
          setSubject(foundSubject);
        } else {
          setError('科目が見つかりません');
        }
      } else {
        setError('科目情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('科目情報の取得に失敗しました:', error);
      setError('科目情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (examType: 'mock' | 'past') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${subjectId}?examType=${examType}`);
      if (response.ok) {
        const data = await response.json();
        // データベースの形式から表形式に変換
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

  const handleSelectTask = (taskId: string, fileType: string) => {
    // タスク選択時の処理
    console.log(`Selected task: ${taskId}, file type: ${fileType}`);
    // ここでタスク詳細ページに遷移する処理を追加
    window.location.href = `/work/subjects/${subjectId}/tasks/${taskId}`;
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-6">
            {error || '科目が見つかりません'}
          </p>
          <Link
            href="/work"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            作業ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* パンくずリスト */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/work" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                作業ホーム
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{subject.subjectName}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* 科目ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{getSubjectIcon(subject.subjectName)}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject.subjectName}</h1>
            <p className="text-gray-600">品質管理業務 - タスク選択</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                subject.examType === 'mock' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {subject.examType === 'mock' ? '模試' : '過去問演習講座'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 試験種選択 */}
      {!selectedType && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            試験種を選択してください
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedType('past')}
              className="p-6 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">過去問演習講座</h3>
                <p className="text-gray-600">過去の入試問題の品質チェック</p>
              </div>
            </button>
            <button
              onClick={() => setSelectedType('mock')}
              className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">模試</h3>
                <p className="text-gray-600">模擬試験の品質チェック</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* タスク一覧 */}
      {selectedType && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedType === 'mock' ? '模試' : '過去問演習講座'} - 作業工程一覧
            </h3>
            <button
              onClick={() => setSelectedType(null)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              試験種選択に戻る
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">タスクを読み込み中...</p>
            </div>
          ) : tasks.length > 0 ? (
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
                      操作
                    </th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectTask(task.taskId, 'all')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          作業開始
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500 mb-4">タスクが定義されていません</p>
              <p className="text-sm text-gray-400">
                開発者ツールでタスクを定義してください
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 