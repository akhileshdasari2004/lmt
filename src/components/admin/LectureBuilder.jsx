import React, { useState } from 'react';

/**
 * LectureBuilder Component
 * Builder for adding/editing lectures with nested chapters
 */
const LectureBuilder = ({ lectures = [], onUpdate }) => {
  const [localLectures, setLocalLectures] = useState(lectures);

  const addLecture = () => {
    const newLecture = {
      id: `lecture-${Date.now()}`,
      title: '',
      chapters: [],
    };
    setLocalLectures([...localLectures, newLecture]);
  };

  const removeLecture = (lectureId) => {
    setLocalLectures(localLectures.filter((l) => l.id !== lectureId));
    onUpdate(localLectures.filter((l) => l.id !== lectureId));
  };

  const updateLecture = (lectureId, field, value) => {
    const updated = localLectures.map((l) =>
      l.id === lectureId ? { ...l, [field]: value } : l
    );
    setLocalLectures(updated);
    onUpdate(updated);
  };

  const addChapter = (lectureId) => {
    const updated = localLectures.map((l) => {
      if (l.id === lectureId) {
        return {
          ...l,
          chapters: [
            ...l.chapters,
            {
              id: `chapter-${Date.now()}`,
              title: '',
              videoUrl: '',
              duration: 0,
            },
          ],
        };
      }
      return l;
    });
    setLocalLectures(updated);
    onUpdate(updated);
  };

  const removeChapter = (lectureId, chapterId) => {
    const updated = localLectures.map((l) => {
      if (l.id === lectureId) {
        return {
          ...l,
          chapters: l.chapters.filter((c) => c.id !== chapterId),
        };
      }
      return l;
    });
    setLocalLectures(updated);
    onUpdate(updated);
  };

  const updateChapter = (lectureId, chapterId, field, value) => {
    const updated = localLectures.map((l) => {
      if (l.id === lectureId) {
        return {
          ...l,
          chapters: l.chapters.map((c) =>
            c.id === chapterId ? { ...c, [field]: value } : c
          ),
        };
      }
      return l;
    });
    setLocalLectures(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {localLectures.map((lecture) => (
        <div key={lecture.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          {/* Lecture Header */}
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Lecture Title"
              value={lecture.title}
              onChange={(e) => updateLecture(lecture.id, 'title', e.target.value)}
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => removeLecture(lecture.id)}
              className="px-3 py-2 bg-red-900 text-red-200 rounded hover:bg-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          {/* Chapters */}
          <div className="space-y-3 ml-4 mb-4">
            <h4 className="text-gray-300 text-sm font-semibold">Chapters</h4>
            {lecture.chapters.map((chapter) => (
              <div key={chapter.id} className="bg-gray-700 p-3 rounded space-y-2">
                <input
                  type="text"
                  placeholder="Chapter Title"
                  value={chapter.title}
                  onChange={(e) => updateChapter(lecture.id, chapter.id, 'title', e.target.value)}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-red-500 outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Video URL (optional)"
                  value={chapter.videoUrl}
                  onChange={(e) =>
                    updateChapter(lecture.id, chapter.id, 'videoUrl', e.target.value)
                  }
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-red-500 outline-none text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={chapter.duration}
                    onChange={(e) =>
                      updateChapter(
                        lecture.id,
                        chapter.id,
                        'duration',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-red-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeChapter(lecture.id, chapter.id)}
                    className="px-3 py-2 bg-red-900 text-red-200 rounded hover:bg-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Chapter Button */}
          <button
            type="button"
            onClick={() => addChapter(lecture.id)}
            className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm transition"
          >
            + Add Chapter
          </button>
        </div>
      ))}

      {/* Add Lecture Button */}
      <button
        type="button"
        onClick={addLecture}
        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
      >
        + Add Lecture
      </button>
    </div>
  );
};

export default LectureBuilder;
