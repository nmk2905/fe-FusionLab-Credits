// src/components/Admin/MilestonesManagement/components/ViewMilestones.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Edit, Trash2, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import milestoneService from "../../../../../services/apis/milestoneApi";

export default function ViewMilestones() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dữ liệu mẫu
  const milestones = [
    {
      id: 1,
      name: "Project Proposal Submission",
      project: "Web Development",
      dueDate: "2024-03-15",
      status: "completed",
      weight: 20,
      description: "Submit initial project proposal"
    },
    {
      id: 2,
      name: "Mid-term Presentation",
      project: "Mobile App",
      dueDate: "2024-04-20",
      status: "in_progress",
      weight: 30,
      description: "Present progress at mid-term"
    },
    {
      id: 3,
      name: "Final Report",
      project: "AI Research",
      dueDate: "2024-05-30",
      status: "pending",
      weight: 50,
      description: "Submit final project report"
    },
    {
      id: 4,
      name: "Code Review",
      project: "Web Development",
      dueDate: "2024-04-10",
      status: "delayed",
      weight: 25,
      description: "Code review with supervisor"
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'delayed': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || milestone.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search milestones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Milestones Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Milestone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMilestones.map((milestone) => (
              <tr key={milestone.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{milestone.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{milestone.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {milestone.project}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} />
                    {milestone.dueDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(milestone.status)}`}>
                    {getStatusIcon(milestone.status)}
                    {milestone.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${milestone.weight}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 font-medium">{milestone.weight}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredMilestones.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first milestone to get started'}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total Milestones</p>
          <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {milestones.filter(m => m.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {milestones.filter(m => m.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Delayed</p>
          <p className="text-2xl font-bold text-red-600">
            {milestones.filter(m => m.status === 'delayed').length}
          </p>
        </div>
      </div>
    </motion.div>
  );
}