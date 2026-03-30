import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LectureBuilder from '../components/admin/LectureBuilder';
import { addCourse, updateCourseAdmin, getCourseForAdmin } from '../services/adminService';
import { uploadFile } from '../services/storageService';

/**
 * Enhanced Admin Course Form
 * Create and edit courses with nested lectures and chapters
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

  const [formData, setFormData] = useState({
    courseName: '',
    instructor: '',
    category: '',
    rating: 0,
    pricingType: 'free',
    price: 0,
    imageFile: null,
    imageUrl: '',
    lectures: [],
  });

  // Load existing course if editing
  useEffect(() => {
    if (isEditing) {
      const loadCourse = async () => {
        try {
          const course = await getCourseForAdmin(courseId);
          if (course) {
            setFormData({
              courseName: course.courseName || '',
              instructor: course.instructor || '',
              category: course.category || '',
              rating: course.rating || 0,
              pricingType: course.pricingType || 'free',
              price: course.price || 0,
              imageFile: null,
              imageUrl: course.imageUrl || '',
              lectures: course.lectures || [],
            });
            if (course.imageUrl) {
              setImagePreview(course.imageUrl);
            }
          }
        } catch (err) {
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

  const handleLecturesUpdate = (lectures) => {
    setFormData((prev) => ({ ...prev, lectures }));
  };

  const validateForm = () => {
    if (!formData.courseName.trim()) {
      setError('Course name is required');
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
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a new one is provided
      if (formData.imageFile) {
        try {
          imageUrl = await uploadFile(formData.imageFile, 'courses');
        } catch (err) {
          setError('Failed to upload image');
          setSubmitting(false);
          return;
        }
      }

      const courseData = {
        courseName: formData.courseName,
        instructor: formData.instructor,
        category: formData.category,
        rating: formData.rating,
        pricingType: formData.pricingType,
        price: formData.pricingType === 'paid' ? formData.price : 0,
        imageUrl,
        lectures: formData.lectures,
      };

      let result;
      if (isEditing) {
        result = await updateCourseAdmin(courseId, courseData);
      } else {
        result = await addCourse(courseData);
      }

      if (result.success) {
        setSuccess(`Course ${isEditing ? 'updated' : 'created'} successfully!`);
        setTimeout(() => {
          navigate('/admin/courses');
        }, 1500);
      } else {
        setError(result.error || 'Failed to save course');
      }
    } catch (err) {
      setError('An error occurred while saving the course');
      console.error(err);
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
              <label className="block text-gray-300 text-sm font-semibold mb-2">Course Name</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to React"
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

          {/* Lectures & Chapters */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
            <LectureBuilder lectures={formData.lectures} onUpdate={handleLecturesUpdate} />
          </div>

          {/* Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="font-semibold">Total Lectures:</span> {formData.lectures.length}
              </p>
              <p>
                <span className="font-semibold">Total Duration:</span>{' '}
                {formData.lectures.reduce((sum, lecture) => {
                  return (
                    sum +
                    lecture.chapters.reduce((chapterSum, chapter) => chapterSum + (chapter.duration || 0), 0)
                  );
                }, 0)}{' '}
                minutes
              </p>
            </div>
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
