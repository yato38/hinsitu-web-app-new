'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SubjectExamTypeFlow from '@/components/common/SubjectExamTypeFlow';
import WorkTaskTable from '@/components/work/WorkTaskTable';

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

export default function WorkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'selection' | 'work'>('selection');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<'mock' | 'past' | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // タスク選択時の処理
  const handleTaskSelect = async (subjectId: string, examType: 'mock' | 'past') => {
    setIsLoading(true);
    
    try {
      // 科目情報を取得
      const subjectsResponse = await fetch('/api/tasks/subjects');
      let subjectName = '';
      if (subjectsResponse.ok) {
        const subjects = await subjectsResponse.json();
        const subject = subjects.find((s: any) => s.subjectId === subjectId);
        if (subject) {
          subjectName = subject.subjectName;
        }
      }
      
      setSelectedSubject({ subjectId, subjectName, examType });
      setSelectedExamType(examType);
      
      // タスク情報を取得
      const response = await fetch(`/api/tasks/${subjectId}?examType=${examType}`);
      if (response.ok) {
        const data = await response.json();
        const taskRows = convertToTableFormat(data.files || []);
        setTasks(taskRows);
        setCurrentView('work');
      } else {
        console.error('タスクの取得に失敗しました');
      }
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
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

  // 科目選択画面に戻る
  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedSubject(null);
    setSelectedExamType(null);
    setTasks([]);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // リダイレクト中
  }

  // 作業画面
  if (currentView === 'work' && selectedSubject && selectedExamType) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {selectedSubject.subjectName} - {selectedExamType === 'mock' ? '模試' : '過去問演習講座'}
                </h2>
                <p className="text-gray-600">
                  品質管理作業 - {session.user.name}さん
                </p>
              </div>
              <button
                onClick={handleBackToSelection}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                科目選択に戻る
              </button>
            </div>
          </div>

          {/* タスク表 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">タスクを読み込み中...</p>
            </div>
          ) : (
            <WorkTaskTable
              tasks={tasks}
              subjectId={selectedSubject.subjectId}
              examType={selectedExamType}
            />
          )}
        </div>
      </div>
    );
  }

  // 科目選択画面
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* ウェルカムメッセージ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ようこそ、{session.user.name}さん
          </h2>
          <p className="text-gray-600">
            品質管理業務を開始するには、作業科目を選択してください。
          </p>
        </div>

        {/* 作業科目選択 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <SubjectExamTypeFlow
            mode="work"
            onBack={() => router.push('/')}
            onWorkStart={handleTaskSelect}
          />
        </div>

        {/* 作業状況サマリー */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            今日の作業状況
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <div className="text-sm text-gray-600">完了タスク</div>
                  <div className="text-xl font-semibold text-green-600">0</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⏳</div>
                <div>
                  <div className="text-sm text-gray-600">進行中</div>
                  <div className="text-xl font-semibold text-yellow-600">0</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📋</div>
                <div>
                  <div className="text-sm text-gray-600">未着手</div>
                  <div className="text-xl font-semibold text-blue-600">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 