import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  approveStudent,
  assignSubjectToStudent,
  getAllPendingRequests,
  getAllStudents,
  getStudentAssignments,
  setLessonRequestStatus,
} from '../services/firestoreService';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignedLessons, setAssignedLessons] = useState([]);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubStudents = getAllStudents(setStudents);
    const unsubRequests = getAllPendingRequests(setRequests);
    return () => {
      if (unsubStudents) unsubStudents();
      if (unsubRequests) unsubRequests();
    };
  }, []);

  useEffect(() => {
    if (!selectedStudent?.uid) {
      setAssignedLessons([]);
      return;
    }
    const unsub = getStudentAssignments(selectedStudent.uid, setAssignedLessons);
    return () => {
      if (unsub) unsub();
    };
  }, [selectedStudent?.uid]);

  const pendingStudents = useMemo(
    () => students.filter((s) => s.status === 'pending'),
    [students],
  );

  const selectedRequests = useMemo(() => {
    if (!selectedStudent?.uid) return [];
    return requests.filter((r) => r.studentId === selectedStudent.uid);
  }, [requests, selectedStudent?.uid]);

  const handleApproveStudent = async (studentId) => {
    try {
      await approveStudent(studentId);
    } catch (err) {
      setError(err.message || 'Failed to approve student');
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    if (destination.droppableId !== 'assignments') return;
    if (!selectedStudent?.uid) return;

    const req = selectedRequests.find((r) => r.requestId === draggableId);
    if (!req) return;

    try {
      setLoadingAssign(true);
      await assignSubjectToStudent(selectedStudent.uid, {
        courseId: req.courseId,
        courseTitle: req.courseTitle,
      });
      await setLessonRequestStatus(req.requestId, 'approved');
    } catch (err) {
      setError(err.message || 'Failed to assign lesson');
    } finally {
      setLoadingAssign(false);
    }
  };

  return (
    <div className="a-page flex flex-col h-screen overflow-hidden admin-page">
      <header className="bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-blue-900">LMT</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full tracking-wide">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input className="a-input w-56" placeholder="Search students..." />
          <select className="a-input w-36">
            <option>All students</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
          <span className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
            {students.length} students
          </span>
        </div>
      </header>

      {error && (
        <div className="px-6 pt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-72 a-panel flex-shrink-0">
            <div className="a-panel-header">
              <span className="a-panel-label">Students</span>
            </div>
            {pendingStudents.map((student) => (
              <div
                key={student.uid}
                className={`a-student-row ${selectedStudent?.uid === student.uid ? 'selected' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">
                      {(student.name || student.email || 'S')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">{student.name || student.email}</p>
                    <p className="text-xs text-blue-400 truncate">{student.email}</p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span className="s-badge-pending">Pending</span>
                  </div>
                </div>
                <button
                  className="a-button mt-2 text-xs px-3 py-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveStudent(student.uid);
                  }}
                >
                  Approve
                </button>
              </div>
            ))}
            {pendingStudents.length === 0 && (
              <div className="p-4 text-sm text-blue-300">No pending students.</div>
            )}
          </aside>

          <div className="flex-1 bg-blue-25 border-r border-blue-100 overflow-y-auto">
            <div className="a-panel-header bg-blue-25">
              <div className="flex items-center justify-between">
                <span className="a-panel-label">Lesson requests</span>
                {selectedStudent && (
                  <span className="text-xs text-blue-600 font-medium">
                    {selectedStudent.name || selectedStudent.email}
                  </span>
                )}
              </div>
            </div>
            {!selectedStudent ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-blue-300">Select a student to view requests</p>
              </div>
            ) : (
              <Droppable droppableId="requests">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-0">
                    {selectedRequests.map((req, index) => (
                      <Draggable key={req.requestId} draggableId={req.requestId} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`a-req-card ${snapshot.isDragging ? 'shadow-admin-card-hover rotate-1 scale-105' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-md">
                                {req.courseTitle}
                              </span>
                              <div className="flex gap-0.5 mt-0.5">
                                {[0, 1, 2].map((d) => (
                                  <div key={d} className="w-1 h-1 rounded-full bg-blue-200" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-blue-900 mt-2">
                              {req.lessonTitle || 'Subject request'}
                            </p>
                            <p className="text-xs text-blue-400 mt-1">Pending request</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>

          <div className="w-80 bg-white overflow-y-auto flex-shrink-0">
            <div className="a-panel-header">
              <span className="a-panel-label">Assigned to</span>
              {selectedStudent && (
                <p className="text-sm font-semibold text-blue-700 mt-0.5">
                  {selectedStudent.name || selectedStudent.email}
                </p>
              )}
            </div>
            <Droppable droppableId="assignments">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`a-drop-zone ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                >
                  {snapshot.isDraggingOver ? (
                    <p className="text-sm font-medium text-blue-500">Release to assign</p>
                  ) : (
                    <p className="text-sm text-blue-300">Drag lessons here to assign</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className="pb-4">
              {assignedLessons.map((lesson) => (
                <div key={`${lesson.courseId}:${lesson.lessonId}`} className="a-assigned-item">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">{lesson.lessonTitle || 'Full subject'}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">{lesson.courseTitle}</p>
                  </div>
                </div>
              ))}
              {loadingAssign && <p className="px-4 text-xs text-blue-500">Assigning subject...</p>}
            </div>
            {selectedStudent?.status === 'pending' && (
              <div className="px-4 pb-4 border-t border-blue-100 pt-4">
                <button onClick={() => handleApproveStudent(selectedStudent.uid)} className="a-button w-full py-2.5">
                  Approve Account
                </button>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default AdminDashboard;
