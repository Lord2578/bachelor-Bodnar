"use client"

import { useState } from "react"
import { Play, Clock, Bookmark, Grid3X3, List } from "lucide-react"
import Image from "next/image"

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("All Resources")
  const [viewMode, setViewMode] = useState("grid")

  const tabs = [
    { id: "all", label: "All Resources" },
    { id: "grammar", label: "Grammar", icon: "📝" },
    { id: "vocabulary", label: "Vocabulary", icon: "📚" },
    { id: "listening", label: "Listening", icon: "🎧" },
    { id: "speaking", label: "Speaking", icon: "🗣️" },
    { id: "writing", label: "Writing", icon: "✍️" },
  ]

  const resources = [
    {
      id: 1,
      title: "Essential Grammar in Use",
      type: "grammar",
      description: "Comprehensive guide to English grammar with practice exercises",
      progress: 45,
      image: "/images/photo1.png",
      action: "Continue",
    },
    {
      id: 2,
      title: "Business English Mastery",
      type: "listening",
      description: "Professional communication skills for the workplace",
      timeAdded: "2 days ago",
      duration: "15:30",
      image: "/images/photo2.jpg",
      action: "Watch",
    },
    {
      id: 3,
      title: "BBC Learning English",
      type: "external",
      description: "Access free English learning resources, lessons, and exercises from BBC",
      externalLink: true,
      logo: "/images/photo3.png",
      action: "Visit Website",
    },
  ]

  type Resource = {
    id: number;
    title: string;
    type: string;
    description: string;
    progress?: number;
    timeAdded?: string;
    duration?: string;
    image?: string;
    externalLink?: boolean;
    logo?: string;
    action: string;
  }

  const listeningPractice = [
    { id: 1, title: "British Accent Training" },
    { id: 2, title: "Business Conversations" },
    { id: 3, title: "Daily Life Situations" },
  ]

  const filteredResources =
    activeTab === "All Resources"
      ? resources
      : resources.filter((resource) => resource.type === activeTab.toLowerCase())

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <div className="p-6 pb-0">
        <h1 className="text-2xl font-semibold mb-6">Learning Resources</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.label ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.id === "all" ? (
                  tab.label
                ) : (
                  <div className="flex items-center gap-2">
                    {tab.id === "grammar" && <span>📝</span>}
                    {tab.id === "vocabulary" && <span>📚</span>}
                    {tab.id === "listening" && <span>🎧</span>}
                    {tab.id === "speaking" && <span>🗣️</span>}
                    {tab.id === "writing" && <span>✍️</span>}
                    {tab.label}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            <button
              className={`p-2 rounded-md ${viewMode === "grid" ? "bg-gray-200" : "bg-white"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              className={`p-2 rounded-md ${viewMode === "list" ? "bg-gray-200" : "bg-white"}`}
              onClick={() => setViewMode("list")}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row p-6 pt-0 gap-6">
        <div className="flex-1">
          <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 gap-6" : "grid-cols-1 gap-4"}`}>
            {filteredResources.map((resource: Resource) =>
              resource.externalLink ? (
                <div key={resource.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {resource.logo && (
                          <Image 
                            src={resource.logo} 
                            alt={resource.title}
                            width={40}
                            height={40}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{resource.title}</h3>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Bookmark size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">External Resource</p>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="px-4 py-1.5 bg-white border border-gray-300 text-blue-600 rounded-md text-sm hover:bg-gray-50 transition">
                        {resource.action}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={resource.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="relative">
                    {resource.image && (
                      <Image 
                        src={resource.image} 
                        alt={resource.title}
                        width={800}
                        height={320}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    {resource.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <Play size={12} />
                        {resource.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Bookmark size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>

                    {resource.progress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress: {resource.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${resource.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {resource.timeAdded && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                        <Clock size={12} />
                        <span>Added {resource.timeAdded}</span>
                      </div>
                    )}

                    <div className="flex justify-end mt-3">
                      <button className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
                        {resource.action}
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <span className="text-lg">🎧</span>
              </div>
              <div>
                <h3 className="font-semibold">Listening Practice</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Intermediate</span>
              </div>
            </div>

            <ul className="space-y-3 mb-4">
              {listeningPractice.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="text-blue-600 font-medium">{item.id}</span>
                  <span className="text-sm">{item.title}</span>
                </li>
              ))}
            </ul>

            <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium">
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

