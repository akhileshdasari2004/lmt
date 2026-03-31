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
    <div className="min-h-screen bg-[#0c1220] text-slate-100 px-4 md:px-8 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">
            Approve students and assign requested subjects.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-danger/40 bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left panel - Students */}
            <div className="bg-[#0c1220]-card border border-[#1e3a5f] rounded-2xl p-4">
              <h2 className="font-semibold mb-3">Pending Students</h2>
              <div className="space-y-2">
                {pendingStudents.length === 0 ? (
                  <p className="text-sm text-slate-400">No pending students.</p>
                ) : (
                  pendingStudents.map((student) => (
                    <div
                      key={student.uid}
                      className={`rounded-xl border p-3 cursor-pointer ${
                        selectedStudent?.uid === student.uid
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-[#1e3a5f]'
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <p className="text-sm font-medium">{student.name || student.email}</p>
                      <p className="text-xs text-text-muted">{student.email}</p>
                      <button
                        className="mt-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveStudent(student.uid);
                        }}
                      >
                        Approve
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Center panel - requests */}
            <Droppable droppableId="requests">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-[#0c1220]-card border border-[#1e3a5f] rounded-2xl p-4"
                >
                  <h2 className="font-semibold mb-3">
                    Requests {selectedStudent ? `for ${selectedStudent.name || selectedStudent.email}` : ''}
                  </h2>
                  <div className="space-y-2 min-h-[200px]">
                    {!selectedStudent ? (
                      <p className="text-sm text-slate-400">Select a student first.</p>
                    ) : selectedRequests.length === 0 ? (
                      <p className="text-sm text-slate-400">No pending requests.</p>
                    ) : (
                      selectedRequests.map((req, index) => (
                        <Draggable key={req.requestId} draggableId={req.requestId} index={index}>
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className="rounded-lg bg-[#0c1220] border border-[#1e3a5f] px-3 py-2"
                            >
                              <p className="text-sm font-medium">{req.courseTitle}</p>
                              <p className="text-xs text-text-muted">Subject request</p>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

            {/* Right panel - assignments */}
            <Droppable droppableId="assignments">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-[#0c1220]-card border rounded-2xl p-4 ${
                    snapshot.isDraggingOver ? 'border-sky-500 bg-sky-500/10' : 'border-[#1e3a5f]'
                  }`}
                >
                  <h2 className="font-semibold mb-3">Assignments</h2>
                  <p className="text-xs text-text-muted mb-3">Drop subjects here to assign.</p>
                  <div className="space-y-2 min-h-[200px]">
                    {assignedLessons.length === 0 ? (
                      <p className="text-sm text-slate-400">No assignments yet.</p>
                    ) : (
                      assignedLessons.map((lesson) => (
                        <div
                          key={`${lesson.courseId}:${lesson.lessonId}`}
                          className="rounded-lg border border-[#1e3a5f] bg-[#0c1220] px-3 py-2"
                        >
                          <p className="text-sm font-medium">{lesson.courseTitle}</p>
                          <p className="text-xs text-text-muted">
                            {lesson.assignmentType === 'subject' ? 'Full subject' : 'Lesson'}
                          </p>
                        </div>
                      ))
                    )}
                    {loadingAssign && (
                      <p className="text-xs text-sky-400">Assigning subject...</p>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default AdminDashboard;
