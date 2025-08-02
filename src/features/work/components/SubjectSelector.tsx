'use client';

interface Subject {
  id: string;
  name: string;
  icon: string;
  examType?: 'mock' | 'past';
}

interface SubjectSelectorProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
}

export default function SubjectSelector({ subjects, onSelectSubject }: SubjectSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        科目を選択してください
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border-2 border-transparent hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
          >
            <div className="text-4xl mb-4 text-center">{subject.icon}</div>
            <h4 className="text-lg font-semibold text-gray-900 text-center">
              {subject.name}
            </h4>
            {subject.examType && (
              <div className="mt-2 text-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  subject.examType === 'mock' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {subject.examType === 'mock' ? '模試' : '過去問演習講座'}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600 text-center mt-2">
              品質チェック作業
            </p>
          </button>
        ))}
      </div>
      
      {subjects.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-500 mb-4">科目がありません</p>
          <p className="text-sm text-gray-400">
            開発者ツールで科目を追加してください
          </p>
        </div>
      )}
    </div>
  );
} 