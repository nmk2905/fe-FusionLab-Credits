import React, { useState, useEffect } from "react";
import taskService from "../../../../../services/apis/taskApi";
import CreateTaskPopup from "./CreateTaskPopup";

const TaskList = ({ milestoneId, milestone }) => {
  const [tasks, setTasks] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch tasks khi component mount hoặc khi milestoneId thay đổi
  useEffect(() => {
    fetchTasks();
  }, [milestoneId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Giả sử bạn có API để lấy tasks theo milestoneId
      // const response = await taskService.getTasksByMilestone(milestoneId);
      // setTasks(response.data || []);

      // Tạm thời sử dụng fake data
      setTasks([
        {
          id: 1,
          title: "Design UI Mockup",
          description: "Create UI design for the milestone",
          status: "Completed",
          assignee: "John Doe",
          dueDate: "2026-08-18",
        },
        // ... other tasks
      ]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (newTask) => {
    // Thêm task mới vào danh sách
    setTasks([
      ...tasks,
      {
        id: tasks.length + 1, // Tạm thời, trong thực tế sẽ dùng ID từ API
        title: newTask.label,
        description: newTask.description,
        status: newTask.status,
        assignee: `User ${newTask.assigneeId}`, // Tạm thời
        dueDate: newTask.dueDate.split("T")[0],
      },
    ]);
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Hàm lấy màu cho status
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Hàm xóa task
  const handleDeleteTask = (taskId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa task này?")) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-5 sm:p-6 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Tasks for "{milestone?.title}"
        </h4>
        <button
          onClick={() => setShowCreatePopup(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new task.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreatePopup(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Task
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table content remains the same */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assignee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.assignee}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Task Summary */}
          <div className="mt-6 bg-gray-50 px-6 py-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium">{tasks.length}</span> tasks
              </div>
              <div className="text-sm text-gray-600">
                Completed:{" "}
                <span className="font-medium">
                  {tasks.filter((t) => t.status === "Completed").length}
                </span>{" "}
                | In Progress:{" "}
                <span className="font-medium">
                  {tasks.filter((t) => t.status === "In Progress").length}
                </span>{" "}
                | Pending:{" "}
                <span className="font-medium">
                  {tasks.filter((t) => t.status === "Pending").length}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Task Popup */}
      <CreateTaskPopup
        isOpen={showCreatePopup}
        onClose={() => setShowCreatePopup(false)}
        milestoneId={milestoneId}
        onTaskAdded={handleAddTask}
      />
    </div>
  );
};

export default TaskList;
