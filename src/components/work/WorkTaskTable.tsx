'use client';

import { useState, useEffect } from 'react';

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

interface WorkProgress {
  taskId: string;
  problem: boolean;
  answer: boolean;
  explanation: boolean;
  scoring: boolean;
}

interface QuestionProgress {
  taskId: string;
  fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  questionNumber: number;
  completed: boolean;
}

interface WorkTaskTableProps {
  tasks: TaskRow[];
  subjectId: string;
  examType: 'mock' | 'past';
}

export default function WorkTaskTable({ tasks, subjectId, examType }: WorkTaskTableProps) {
  const [workProgress, setWorkProgress] = useState<WorkProgress[]>([]);
  const [questionProgress, setQuestionProgress] = useState<QuestionProgress[]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    taskId: string;
    fileType: 'problem' | 'answer' | 'explanation' | 'scoring';
  } | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [referenceData, setReferenceData] = useState('');
  const [aiOutput, setAiOutput] = useState('');

                // 初期化時に作業進捗を設定
              useEffect(() => {
                const fetchProgress = async () => {
                  try {
                    const response = await fetch(`/api/work/progress?subjectId=${subjectId}&examType=${examType}`);
                    if (response.ok) {
                      const data = await response.json();
                      const savedProgress = data.progress || [];

                      // 保存された進捗をマップに変換
                      const progressMap = new Map();
                      const questionProgressMap = new Map();
                      
                      savedProgress.forEach((item: any) => {
                        // タスクごとの進捗
                        if (!progressMap.has(item.taskId)) {
                          progressMap.set(item.taskId, {
                            taskId: item.taskId,
                            problem: false,
                            answer: false,
                            explanation: false,
                            scoring: false
                          });
                        }
                        
                        // 大問ごとの進捗
                        const questionKey = `${item.taskId}-${item.fileType}-${item.questionNumber}`;
                        questionProgressMap.set(questionKey, {
                          taskId: item.taskId,
                          fileType: item.fileType,
                          questionNumber: item.questionNumber,
                          completed: true
                        });
                        
                        // ファイルタイプごとの完了判定（全ての大問が完了しているかチェック）
                        const fileTypeQuestions = [1, 2, 3, 4];
                        const allQuestionsCompleted = fileTypeQuestions.every(qNum => 
                          questionProgressMap.has(`${item.taskId}-${item.fileType}-${qNum}`)
                        );
                        
                        if (allQuestionsCompleted) {
                          progressMap.get(item.taskId)[item.fileType] = true;
                        }
                      });

                      // タスクごとの進捗を設定
                      const initialProgress = tasks.map(task =>
                        progressMap.get(task.taskId) || {
                          taskId: task.taskId,
                          problem: false,
                          answer: false,
                          explanation: false,
                          scoring: false
                        }
                      );
                      setWorkProgress(initialProgress);
                      
                      // 大問ごとの進捗を設定
                      setQuestionProgress(Array.from(questionProgressMap.values()));
                    }
                  } catch (error) {
                    console.error('作業進捗の取得に失敗しました:', error);
                    // エラーの場合は初期状態を設定
                    const initialProgress = tasks.map(task => ({
                      taskId: task.taskId,
                      problem: false,
                      answer: false,
                      explanation: false,
                      scoring: false
                    }));
                    setWorkProgress(initialProgress);
                    setQuestionProgress([]);
                  }
                };

                if (tasks.length > 0) {
                  fetchProgress();
                }
              }, [tasks, subjectId, examType]);

  // セルクリック時の処理
  const handleCellClick = (taskId: string, fileType: 'problem' | 'answer' | 'explanation' | 'scoring') => {
    setSelectedCell({ taskId, fileType });
    setShowQuestionModal(true);
  };

  // 大問選択時の処理
  const handleQuestionSelect = (questionNumber: number) => {
    setSelectedQuestion(questionNumber);
    setShowQuestionModal(false);
    setShowWorkModal(true);
  };

                // 作業完了時の処理
              const handleWorkComplete = async () => {
                if (selectedCell && selectedQuestion) {
                  try {
                    // APIに作業データを送信
                    const response = await fetch('/api/work/progress', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        taskId: selectedCell.taskId,
                        fileType: selectedCell.fileType,
                        questionNumber: selectedQuestion,
                        referenceData,
                        aiOutput,
                        subjectId,
                        examType
                      }),
                    });

                    if (response.ok) {
                      // 大問ごとの進捗を更新
                      const questionKey = `${selectedCell.taskId}-${selectedCell.fileType}-${selectedQuestion}`;
                      setQuestionProgress(prev => {
                        const existing = prev.find(q => 
                          q.taskId === selectedCell.taskId && 
                          q.fileType === selectedCell.fileType && 
                          q.questionNumber === selectedQuestion
                        );
                        
                        if (existing) {
                          return prev.map(q => 
                            q === existing ? { ...q, completed: true } : q
                          );
                        } else {
                          return [...prev, {
                            taskId: selectedCell.taskId,
                            fileType: selectedCell.fileType,
                            questionNumber: selectedQuestion,
                            completed: true
                          }];
                        }
                      });

                      // ファイルタイプ全体の完了判定
                      const updatedQuestionProgress = questionProgress.filter(q => 
                        !(q.taskId === selectedCell.taskId && q.fileType === selectedCell.fileType)
                      );
                      const newQuestion = {
                        taskId: selectedCell.taskId,
                        fileType: selectedCell.fileType,
                        questionNumber: selectedQuestion,
                        completed: true
                      };
                      const allQuestionsForFileType = [...updatedQuestionProgress, newQuestion].filter(q => 
                        q.taskId === selectedCell.taskId && q.fileType === selectedCell.fileType
                      );
                      
                      // 全ての大問（1-4）が完了しているかチェック
                      const allQuestionsCompleted = [1, 2, 3, 4].every(qNum => 
                        allQuestionsForFileType.some(q => q.questionNumber === qNum && q.completed)
                      );
                      
                      if (allQuestionsCompleted) {
                        // ファイルタイプ全体が完了した場合、タスク進捗を更新
                        setWorkProgress(prev =>
                          prev.map(progress =>
                            progress.taskId === selectedCell.taskId
                              ? { ...progress, [selectedCell.fileType]: true }
                              : progress
                          )
                        );
                      }

                      console.log('作業完了:', {
                        taskId: selectedCell.taskId,
                        fileType: selectedCell.fileType,
                        questionNumber: selectedQuestion,
                        referenceData,
                        aiOutput
                      });
                    } else {
                      console.error('作業進捗の保存に失敗しました');
                      alert('作業進捗の保存に失敗しました。もう一度お試しください。');
                      return;
                    }
                  } catch (error) {
                    console.error('作業進捗の保存に失敗しました:', error);
                    alert('作業進捗の保存に失敗しました。もう一度お試しください。');
                    return;
                  }

                  // モーダルを閉じる
                  setShowWorkModal(false);
                  setSelectedCell(null);
                  setSelectedQuestion(null);
                  setReferenceData('');
                  setAiOutput('');
                }
              };

  // タスクの完了状況をチェック
  const isTaskCompleted = (taskId: string) => {
    const progress = workProgress.find(p => p.taskId === taskId);
    return progress && progress.problem && progress.answer && progress.explanation && progress.scoring;
  };

                // セルの完了状況をチェック
              const isCellCompleted = (taskId: string, fileType: 'problem' | 'answer' | 'explanation' | 'scoring') => {
                const progress = workProgress.find(p => p.taskId === taskId);
                return progress ? progress[fileType] : false;
              };

              // 大問の完了状況をチェック
              const isQuestionCompleted = (taskId: string, fileType: 'problem' | 'answer' | 'explanation' | 'scoring', questionNumber: number) => {
                return questionProgress.some(q => 
                  q.taskId === taskId && 
                  q.fileType === fileType && 
                  q.questionNumber === questionNumber && 
                  q.completed
                );
              };

              // ファイルタイプの完了済み大問数を取得
              const getCompletedQuestionsCount = (taskId: string, fileType: 'problem' | 'answer' | 'explanation' | 'scoring') => {
                return questionProgress.filter(q => 
                  q.taskId === taskId && 
                  q.fileType === fileType && 
                  q.completed
                ).length;
              };

  return (
    <div className="space-y-6">
      {/* 作業進捗サマリー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">作業進捗</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <div className="text-sm text-gray-600">完了タスク</div>
                <div className="text-xl font-semibold text-green-600">
                  {workProgress.filter(p => isTaskCompleted(p.taskId)).length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏳</div>
              <div>
                <div className="text-sm text-gray-600">進行中</div>
                <div className="text-xl font-semibold text-yellow-600">
                  {workProgress.filter(p => !isTaskCompleted(p.taskId) && 
                    (p.problem || p.answer || p.explanation || p.scoring)).length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <div className="text-sm text-gray-600">未着手</div>
                <div className="text-xl font-semibold text-blue-600">
                  {workProgress.filter(p => !p.problem && !p.answer && !p.explanation && !p.scoring).length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <div className="text-sm text-gray-600">総タスク</div>
                <div className="text-xl font-semibold text-gray-600">
                  {tasks.length}
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  ステータス
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
                                                <td
                                className={`px-6 py-4 text-sm cursor-pointer transition-colors ${
                                  isCellCompleted(task.taskId, 'problem')
                                    ? 'bg-green-100 text-green-800'
                                    : 'text-gray-900 hover:bg-blue-50'
                                }`}
                                onClick={() => handleCellClick(task.taskId, 'problem')}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{task.problem || 'クリックして作業開始'}</span>
                                  <div className="flex items-center space-x-1">
                                    {!isCellCompleted(task.taskId, 'problem') && (
                                      <span className="text-xs text-gray-500">
                                        ({getCompletedQuestionsCount(task.taskId, 'problem')}/4)
                                      </span>
                                    )}
                                    {isCellCompleted(task.taskId, 'problem') && (
                                      <span className="text-green-600">✅</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                                                <td
                                className={`px-6 py-4 text-sm cursor-pointer transition-colors ${
                                  isCellCompleted(task.taskId, 'answer')
                                    ? 'bg-green-100 text-green-800'
                                    : 'text-gray-900 hover:bg-blue-50'
                                }`}
                                onClick={() => handleCellClick(task.taskId, 'answer')}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{task.answer || 'クリックして作業開始'}</span>
                                  <div className="flex items-center space-x-1">
                                    {!isCellCompleted(task.taskId, 'answer') && (
                                      <span className="text-xs text-gray-500">
                                        ({getCompletedQuestionsCount(task.taskId, 'answer')}/4)
                                      </span>
                                    )}
                                    {isCellCompleted(task.taskId, 'answer') && (
                                      <span className="text-green-600">✅</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                                                <td
                                className={`px-6 py-4 text-sm cursor-pointer transition-colors ${
                                  isCellCompleted(task.taskId, 'explanation')
                                    ? 'bg-green-100 text-green-800'
                                    : 'text-gray-900 hover:bg-blue-50'
                                }`}
                                onClick={() => handleCellClick(task.taskId, 'explanation')}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{task.explanation || 'クリックして作業開始'}</span>
                                  <div className="flex items-center space-x-1">
                                    {!isCellCompleted(task.taskId, 'explanation') && (
                                      <span className="text-xs text-gray-500">
                                        ({getCompletedQuestionsCount(task.taskId, 'explanation')}/4)
                                      </span>
                                    )}
                                    {isCellCompleted(task.taskId, 'explanation') && (
                                      <span className="text-green-600">✅</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                                                <td
                                className={`px-6 py-4 text-sm cursor-pointer transition-colors ${
                                  isCellCompleted(task.taskId, 'scoring')
                                    ? 'bg-green-100 text-green-800'
                                    : 'text-gray-900 hover:bg-blue-50'
                                }`}
                                onClick={() => handleCellClick(task.taskId, 'scoring')}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{task.scoring || 'クリックして作業開始'}</span>
                                  <div className="flex items-center space-x-1">
                                    {!isCellCompleted(task.taskId, 'scoring') && (
                                      <span className="text-xs text-gray-500">
                                        ({getCompletedQuestionsCount(task.taskId, 'scoring')}/4)
                                      </span>
                                    )}
                                    {isCellCompleted(task.taskId, 'scoring') && (
                                      <span className="text-green-600">✅</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isTaskCompleted(task.taskId) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        完了
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        未完了
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

                        {/* 大問選択モーダル */}
                  {showQuestionModal && selectedCell && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          大問を選択してください
                        </h3>
                        <p className="text-gray-600 mb-4">
                          タスク {selectedCell.taskId} - {selectedCell.fileType === 'problem' ? '問題用紙' :
                            selectedCell.fileType === 'answer' ? '解答用紙' :
                            selectedCell.fileType === 'explanation' ? '解答解説' : '採点基準'}
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {[1, 2, 3, 4].map((questionNumber) => {
                            const isCompleted = isQuestionCompleted(selectedCell.taskId, selectedCell.fileType, questionNumber);
                            return (
                              <button
                                key={questionNumber}
                                onClick={() => handleQuestionSelect(questionNumber)}
                                className={`p-4 border-2 rounded-lg transition-all duration-200 text-center ${
                                  isCompleted
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                                  大問{questionNumber}
                                  {isCompleted && (
                                    <span className="ml-2 text-green-600">✅</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowQuestionModal(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

      {/* 作業モーダル */}
      {showWorkModal && selectedCell && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                作業 - 大問{selectedQuestion}
              </h3>
              <button
                onClick={() => setShowWorkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 参照データ入力 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">参照データ</h4>
                <textarea
                  value={referenceData}
                  onChange={(e) => setReferenceData(e.target.value)}
                  placeholder="参照データを入力してください..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* AI出力 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">AI出力</h4>
                <textarea
                  value={aiOutput}
                  onChange={(e) => setAiOutput(e.target.value)}
                  placeholder="AI出力を入力してください..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWorkModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleWorkComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                作業完了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 