'use client';

import { useState, useEffect } from 'react';

interface TaskSelectorProps {
  subjectId: string;
  onSelectTask: (taskId: string, fileType: string) => void;
}

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

export default function TaskSelector({ subjectId, onSelectTask }: TaskSelectorProps) {
  const [subjectTasks, setSubjectTasks] = useState<SubjectTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データベースからタスク定義を取得
  useEffect(() => {
    const fetchTaskDefinitions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/tasks/${subjectId}`);
        if (response.ok) {
          const data = await response.json();
          setSubjectTasks({
            subjectId: data.subjectId || subjectId,
            subjectName: data.subjectName || getSubjectName(subjectId),
            files: data.files || []
          });
        } else {
          setError('タスク定義の取得に失敗しました');
        }
      } catch (error) {
        console.error('タスク定義の取得に失敗しました:', error);
        setError('タスク定義の取得に失敗しました');
      } finally {
        setIsLoading(false);
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

  const getSubjectIcon = (subjectId: string) => {
    const subjectIcons: { [key: string]: string } = {
      'english': '🇺🇸',
      'japanese': '🇯🇵',
      'math': '📐',
      'development': '🔧'
    };
    return subjectIcons[subjectId] || '❓';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 mb-4">
            タスク定義を読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !subjectTasks) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🚧</div>
          <p className="text-gray-600 mb-4">
            {error || `${getSubjectName(subjectId)}のタスクは現在準備中です。`}
          </p>
          <p className="text-sm text-gray-500">
            開発者モードでタスク定義を作成してください。
          </p>
        </div>
      </div>
    );
  }

  // 全てのタスクID（1-19）を生成
  const allTaskIds = Array.from({ length: 19 }, (_, i) => (i + 1).toString());

  // タスクが存在しない場合のデフォルト表示
  if (subjectTasks.files.length === 0 || subjectTasks.files.every(file => file.tasks.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {getSubjectIcon(subjectId)} {subjectTasks.subjectName} - タスク選択
        </h3>
        
        <div className="text-center py-8 mb-6">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 mb-4">タスクが定義されていません</p>
          <p className="text-sm text-gray-400 mb-6">
            開発者モードでタスクを定義してください
          </p>
        </div>

        {/* デフォルトのタスク表 */}
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
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900 bg-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📄</span>
                    問題用紙
                  </div>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900 bg-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">✏️</span>
                    解答用紙
                  </div>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900 bg-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📖</span>
                    解答解説
                  </div>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900 bg-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📊</span>
                    採点基準
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-blue-50">
                  1
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-gray-50">
                  把握系
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-400 text-center">
                  -
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-400 text-center">
                  -
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-400 text-center">
                  -
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-400 text-center">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {getSubjectIcon(subjectId)} {subjectTasks.subjectName} - タスク選択
      </h3>
      
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
            {allTaskIds.map(taskId => (
              <tr key={taskId} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-blue-50">
                  {taskId}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-gray-50">
                  {getTaskRemark(taskId)}
                </td>
                {subjectTasks.files.map(file => {
                  const fileTask = file.tasks.find(t => t.taskId === taskId);
                  
                  return (
                    <td key={file.fileType} className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {fileTask ? (
                        <button
                          onClick={() => onSelectTask(taskId, file.fileType)}
                          className="text-blue-600 hover:text-blue-900 hover:underline block w-full text-left"
                          title={fileTask.description}
                        >
                          {fileTask.taskName || fileTask.remark || 'タスク'}
                        </button>
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
  );
}

// タスクIDに対応する備考を取得
function getTaskRemark(taskId: string) {
  const remarks: { [key: string]: string } = {
    '1': '把握系',
    '2': '全訳系',
    '3': '剽窃はないか',
    '4': '引用の誤り',
    '5': '解答解説齟齬',
    '6': '選択肢番号訳',
    '7': 'かっこの使用法',
    '8': '明確な事実誤認',
    '9': '誤字脱字',
    '10': '解答が満点になるか',
    '11': '大学満点',
    '12': '問題採点基準',
    '13': '解説採点基準',
    '14': '問題の注釈',
    '15': '解答欄の大きさ',
    '16': '選択肢過不足',
    '17': '重要語句',
    '18': 'その他',
    '19': '成果物の確認'
  };
  return remarks[taskId] || '';
} 