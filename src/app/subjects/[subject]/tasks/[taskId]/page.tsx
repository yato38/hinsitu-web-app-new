'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getSubjectTasks, getSubjectInfo, type TaskItem } from '@/data/subjectTasks';

export default function TaskExecutionPage() {
  const { data: session } = useSession();
  const params = useParams();
  const subjectId = params.subject as string;
  const taskId = params.taskId as string;
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>(['', '', '']);
  const [inputTexts, setInputTexts] = useState<string[]>(['', '', '']);

  // 科目情報とタスクデータを取得
  const subjectInfo = getSubjectInfo(subjectId);
  const subjectTasks = getSubjectTasks(subjectId);

  // タスク情報を取得
  let task = { name: '不明なタスク', description: '' };
  if (subjectTasks) {
    for (const file of subjectTasks.files) {
      const foundTask = file.tasks.find((t: TaskItem) => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        break;
      }
    }
  }

  // 大問の数（試験種によって決まる）
  const questionSections = [
    { id: 1, name: '第1問' },
    { id: 2, name: '第2問' },
    { id: 3, name: '第3問' }
  ];

  const handleInputChange = (index: number, value: string) => {
    const newInputTexts = [...inputTexts];
    newInputTexts[index] = value;
    setInputTexts(newInputTexts);
  };

  const handleSubmit = async (index: number) => {
    if (!inputTexts[index].trim()) {
      alert('テキストを入力してください。');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `以下のテキストについて${task.name}を行ってください。不備があれば指摘してください：\n\n${inputTexts[index]}`,
          taskType: 'citation_check'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newResults = [...results];
        newResults[index] = data.response;
        setResults(newResults);
      } else {
        const newResults = [...results];
        newResults[index] = 'エラーが発生しました。もう一度お試しください。';
        setResults(newResults);
      }
    } catch {
      const newResults = [...results];
      newResults[index] = '接続エラーが発生しました。';
      setResults(newResults);
    } finally {
      setIsLoading(false);
    }
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
                <Link href={`/subjects/${subjectId}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  {subjectInfo.name}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{task.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* タスク情報 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{subjectInfo.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subjectInfo.name}</h1>
            <p className="text-gray-600">{task.name} - 品質チェック実行</p>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          {task.description}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">作業手順</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. 各大問のタブを選択してください</li>
            <li>2. 入力ウィンドウに本文のテキストをコピー&ペーストしてください</li>
            <li>3. 「チェック実行」ボタンをクリックしてAIによる品質チェックを開始してください</li>
            <li>4. 出力ウィンドウに表示される結果を確認してください</li>
          </ol>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {questionSections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {questionSections.map((section, index) => (
            <div
              key={section.id}
              className={activeTab === index ? 'block' : 'hidden'}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {section.name} - テキスト入力
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 入力ウィンドウ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    本文テキスト
                  </label>
                  <textarea
                    value={inputTexts[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder={`${section.name}の本文テキストをここにコピー&ペーストしてください...`}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-4">
                    <button
                      onClick={() => handleSubmit(index)}
                      disabled={isLoading || !inputTexts[index].trim()}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'チェック中...' : 'チェック実行'}
                    </button>
                  </div>
                </div>

                {/* 出力ウィンドウ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI チェック結果
                  </label>
                  <div className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                    {results[index] ? (
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {results[index]}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        チェック結果がここに表示されます
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        const newInputTexts = [...inputTexts];
                        newInputTexts[index] = '';
                        setInputTexts(newInputTexts);
                        const newResults = [...results];
                        newResults[index] = '';
                        setResults(newResults);
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      クリア
                    </button>
                    <button
                      onClick={() => {
                        if (results[index]) {
                          navigator.clipboard.writeText(results[index]);
                          alert('結果をクリップボードにコピーしました。');
                        }
                      }}
                      disabled={!results[index]}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      結果をコピー
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 進捗状況 */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          進捗状況
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questionSections.map((section, index) => (
            <div key={section.id} className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-semibold ${
                results[index] ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {results[index] ? '✓' : (index + 1)}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-900">
                {section.name}
              </div>
              <div className="text-xs text-gray-500">
                {results[index] ? '完了' : '未完了'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 