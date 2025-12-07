import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, BookOpen, Users, Plus, Trash2 } from "lucide-react";

export default function CreateSemester() {
  const [semesterData, setSemesterData] = useState({
    name: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
    projects: [],
  });

  const [newProject, setNewProject] = useState({
    name: "",
    instructor: "",
    maxStudents: 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Semester created:", semesterData);
    // Xử lý tạo học kỳ
    alert("Học kỳ đã được tạo thành công!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSemesterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProject = () => {
    if (newProject.name && newProject.instructor) {
      setSemesterData((prev) => ({
        ...prev,
        projects: [...prev.projects, { ...newProject, id: Date.now() }],
      }));
      setNewProject({ name: "", instructor: "", maxStudents: 1 });
    }
  };

  const handleRemoveProject = (id) => {
    setSemesterData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tạo Học kỳ mới</h1>
        <p className="text-gray-600">Tạo học kỳ mới và quản lý các project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Semester Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Thông tin Học kỳ
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên học kỳ *
                </label>
                <input
                  type="text"
                  name="name"
                  value={semesterData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Học kỳ 1 năm học 2023-2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học *
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={semesterData.academicYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 2023-2024"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Thời gian học kỳ
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={semesterData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={semesterData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mở đăng ký từ *
                  </label>
                  <input
                    type="date"
                    name="registrationStart"
                    value={semesterData.registrationStart}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đến *
                  </label>
                  <input
                    type="date"
                    name="registrationEnd"
                    value={semesterData.registrationEnd}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="mr-2" size={20} />
            Danh sách Project trong học kỳ
          </h2>

          {/* Add Project Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-4 text-gray-700">Thêm Project mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Project
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảng viên
                </label>
                <select
                  value={newProject.instructor}
                  onChange={(e) =>
                    setNewProject({ ...newProject, instructor: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn giảng viên</option>
                  <option value="gv1">TS. Nguyễn Văn A</option>
                  <option value="gv2">ThS. Trần Thị B</option>
                  <option value="gv3">PGS.TS. Lê Văn C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số SV tối đa
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newProject.maxStudents}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      maxStudents: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Thêm Project</span>
            </button>
          </div>

          {/* Projects Table */}
          {semesterData.projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giảng viên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số SV tối đa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {semesterData.projects.map((project, index) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {project.instructor}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {project.maxStudents} SV
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveProject(project.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Chưa có project nào được thêm vào học kỳ này</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Tạo Học kỳ</h3>
              <p className="text-gray-600">Xác nhận tạo học kỳ mới</p>
            </div>
            <div className="space-x-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo Học kỳ
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
