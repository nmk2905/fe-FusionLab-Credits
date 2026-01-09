// src/components/Admin/MilestonesManagement/index.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import CreateMilestone from "./components/CreateMilestone";
import ViewMilestones from "./components/ViewMilestones";
import { Flag, Eye, Plus, Target } from "lucide-react";

export default function MilestonesManagement() {
  const [activeTab, setActiveTab] = useState("view"); // "view" hoặc "create"

  const tabs = [
    {
      id: "view",
      label: "View Milestones",
      icon: <Eye size={18} />,
      component: <ViewMilestones />,
    },
    {
      id: "create",
      label: "Create Milestone",
      icon: <Plus size={18} />,
      component: <CreateMilestone />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Target size={28} /> {/* Hoặc có thể dùng Flag icon */}
            Milestones Management
          </h1>
          <p className="text-gray-600">
            Manage and create milestones for project tracking
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all
                ${
                  activeTab === tab.id
                    ? "bg-white border border-b-0 border-gray-300 text-blue-600 border-t-2 border-t-blue-500"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </motion.div>
  );
}
