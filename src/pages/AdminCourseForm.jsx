import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createCourse, updateCourse, getCourseById, bulkCreateLessons } from '../services/adminCourseService';
import { uploadAvatar } from '../services/storageService';

/**
 * Admin Course Form
 * Create and edit courses
 * Lessons are managed separately via the CourseManage page
 */
const AdminCourseForm = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const isEditing = !!courseId;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    rating: 0,
    pricingType: 'free',
    price: 0,
    imageFile: null,
    imageUrl: '',
    lessons: [],
  });

  // Load existing course if editing
  useEffect(() => {
    if (isEditing) {
      const loadCourse = async () => {
        try {
          const course = await getCourseById(courseId);
          if (course) {
            setFormData({
              title: course.title || '',
              description: course.description || '',
              instructor: course.instructor || '',
              category: course.category || '',
              rating: course.rating || 0,
              pricingType: course.pricingType || 'free',
              price: course.price || 0,
              imageFile: null,
              imageUrl: course.imageUrl || '',
            });
            if (course.imageUrl) {
              setImagePreview(course.imageUrl);
            }
          }
        } catch (err) {
          console.error('Error loading course:', err);
          setError('Failed to load course');
        } finally {
          setLoading(false);
        }
      };

      loadCourse();
    }
  }, [courseId, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : name === 'rating' || name === 'price' ? parseFloat(value) : value,
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLesson = () => {
    if (!newLessonTitle.trim()) {
      setError('Lesson title is required');
      return;
    }
    
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle.trim(),
      content: newLessonContent.trim(),
      order: formData.lessons.length,
    };

    setFormData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }));

    setNewLessonTitle('');
    setNewLessonContent('');
    setError('');
  };

  const removeLesson = (lessonId) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((l) => l.id !== lessonId),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Course title is required');
      return false;
    }
    if (!formData.instructor.trim()) {
      setError('Instructor name is required');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return false;
    }
    if (formData.pricingType === 'paid' && formData.price <= 0) {
      setError('Price must be greater than 0 for paid courses');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a new one is provided
      if (formData.imageFile) {
        try {
          imageUrl = await uploadAvatar(courseId || `course-${Date.now()}`, formData.imageFile);
        } catch (err) {
          console.error('Error uploading image:', err);
          setError('Failed to upload image');
          setSubmitting(false);
          return;
        }
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        instructor: formData.instructor,
        category: formData.category,
        rating: formData.rating,
        pricingType: formData.pricingType,
        price: formData.pricingType === 'paid' ? formData.price : 0,
        imageUrl,
      };

      let actualCourseId = courseId;

      if (isEditing) {
        await updateCourse(courseId, courseData);
      } else {
        console.log('Creating course with data:', courseData);
        actualCourseId = await createCourse(courseData);
        console.log('✅ Course created with ID:', actualCourseId);
      }

      // Create lessons if any were added (only for new courses)
      if (!isEditing && formData.lessons && formData.lessons.length > 0) {
        try {
          const lessonsToCreate = formData.lessons.map((lesson) => ({
            title: lesson.title,
            content: lesson.content,
          }));
          console.log('📚 Creating lessons:', lessonsToCreate);
          const lessonIds = await bulkCreateLessons(actualCourseId, lessonsToCreate);
          console.log('✅ Lessons created with IDs:', lessonIds);
        } catch (lessonErr) {
          console.error('❌ Error creating lessons:', lessonErr);
          setError(`Course created but lessons failed: ${lessonErr.message}`);
          setSubmitting(false);
          return;
        }
      }

      setSuccess(`Course ${isEditing ? 'updated' : 'created'} successfully!`);
      setTimeout(() => {
        navigate('/admin/courses');
      }, 1500);
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/courses')}
            className="text-gray-400 hover:text-white text-sm mb-4 transition"
          >
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900 bg-opacity-50 border border-green-700 text-green-200 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to React"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Course description"
                rows="3"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Instructor</label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Instructor name"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
                >
                  <option value="">Select a category</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Rating</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Pricing Type</label>
                <select
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {formData.pricingType === 'paid' && (
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-red-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Course Image */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Course Image</h2>

            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded border border-gray-600 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Recommended: 1200x600px</p>
          </div>

          {/* Lessons Management */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📚 Course Lessons</h2>
            <p className="text-gray-400 text-sm mb-4">
              Add lessons directly here. They will be created with the course.
            </p>

            {/* Add Lesson Form */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6 space-y-3">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Lesson Title</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g., Introduction to Components"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded border border-gray-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Lesson Content (Optional)</label>
                <textarea
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  placeholder="Lesson notes or description..."
                  rows="2"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded border border-gray-500 focus:border-red-500 outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={addLesson}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition"
              >
                + Add Lesson
              </button>
            </div>

            {/* Lessons List */}
            {formData.lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No lessons added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold mb-3">
                  {formData.lessons.length} {formData.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                </p>
                {formData.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="bg-gray-700 rounded p-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                        <h3 className="text-white font-medium">{lesson.title}</h3>
                      </div>
                      {lesson.content && (
                        <p className="text-gray-400 text-sm line-clamp-1">{lesson.content}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLesson(lesson.id)}
                      className="ml-2 text-red-400 hover:text-red-300 text-sm font-medium transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCourseForm;
