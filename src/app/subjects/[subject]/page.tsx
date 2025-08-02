'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import TaskSelector from '@/features/work/components/TaskSelector';
import { getSubjectInfo } from '@/data/subjectTasks';

interface SubjectTasks {
  subjectId: string;
  subjectName: string;
  files: {
    fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
    fileName: string;
    tasks: {
      id: string;
      taskId: string;
      taskName: string;
      description: string;
      remark: string;
    }[];
  }[];
}

export default function SubjectPage() {
  const { data: session } = useSession();
  const params = useParams();
  const subjectId = params.subject as string;
  const [selectedType, setSelectedType] = useState<'past' | 'mock' | null>(null);
  const [subjectTasks, setSubjectTasks] = useState<SubjectTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 科目情報を取得
  const subjectInfo = getSubjectInfo(subjectId);

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

  // 科目が利用可能でない場合の開発中表示
  if (!subjectInfo.available) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {subjectInfo.name}の品質管理機能は開発中です
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            現在、{subjectInfo.name}の品質管理機能は開発中です。
            英語の品質管理機能が利用可能ですので、そちらをお試しください。
          </p>
          <div className="space-y-4">
            <Link
              href="/subjects/english"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              英語の品質管理を試す
            </Link>
            <div>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectTask = (taskId: string, fileType: string) => {
    // タスク選択時にタスク詳細ページに遷移
    window.location.href = `/subjects/${subjectId}/tasks/${taskId}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">タスク定義を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {error}
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
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
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                ホーム
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{subjectInfo.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* 科目ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{subjectInfo.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subjectInfo.name}</h1>
            <p className="text-gray-600">品質管理業務 - タスク選択</p>
          </div>
        </div>
      </div>

      {/* 自動的に模試を選択してタスク表示 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          模試 - 作業工程一覧
        </h3>
        <p className="text-gray-600 mb-6">
          品質管理作業は以下の4つのファイルに分かれており、各ファイルに対して作業すべき工程が決められています。
        </p>
        
        <TaskSelector
          subjectId={subjectId}
          onSelectTask={handleSelectTask}
        />
      </div>
    </div>
  );
} 