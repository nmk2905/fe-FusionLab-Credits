import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Upload, Calendar, Users, BookOpen } from "lucide-react";

export default function CreateProject() {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    semester: "",
    instructor: "",
    maxStudents: 1,
    deadline: "",
    requirements: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Project created:", projectData);
    // Xử lý tạo project
    alert("Project đã được tạo thành công!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tạo Project mới</h1>
        <p className="text-gray-600">Tạo project cho sinh viên đăng ký</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Project Name */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                Thông tin Project
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Project *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={projectData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên project"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả Project
                  </label>
                  <textarea
                    name="description"
                    value={projectData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả chi tiết về project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yêu cầu
                  </label>
                  <textarea
                    name="requirements"
                    value={projectData.requirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Các yêu cầu cần thiết..."
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="mr-2" size={20} />
                Tài liệu đính kèm
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="mx-auto text-gray-400 mb-4" size={40} />
                <p className="text-gray-600 mb-2">
                  Kéo thả file hoặc click để upload
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, PPT (Tối đa 10MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Chọn file
                </label>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Thời gian & Cài đặt
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Học kỳ *
                  </label>
                  <select
                    name="semester"
                    value={projectData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn học kỳ</option>
                    <option value="2023-1">Học kỳ 1 (2023-2024)</option>
                    <option value="2023-2">Học kỳ 2 (2023-2024)</option>
                    <option value="2024-1">Học kỳ 1 (2024-2025)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giảng viên hướng dẫn *
                  </label>
                  <select
                    name="instructor"
                    value={projectData.instructor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn giảng viên</option>
                    <option value="gv1">TS. Nguyễn Văn A</option>
                    <option value="gv2">ThS. Trần Thị B</option>
                    <option value="gv3">PGS.TS. Lê Văn C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số sinh viên tối đa *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      name="maxStudents"
                      min="1"
                      max="10"
                      value={projectData.maxStudents}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold">
                      {projectData.maxStudents}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline đăng ký *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={projectData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Save className="mr-2" size={20} />
                Hoàn tất
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Tóm tắt</p>
                    <p className="text-sm text-gray-600">
                      Kiểm tra lại thông tin trước khi tạo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">Sẵn sàng tạo</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save size={20} />
                    <span>Tạo Project</span>
                  </button>

                  <button
                    type="button"
                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Lưu nháp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
