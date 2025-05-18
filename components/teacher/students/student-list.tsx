"use client"

import { useState } from "react"
import Link from "next/link"
import { students } from "@/mock/students"
import { levels } from "@/mock/levels"

export default function StudentList() {
  const [selectedLevel, setSelectedLevel] = useState("Всі")

  const filteredStudents =
    selectedLevel === "Всі" ? students : students.filter((student) => student.level === selectedLevel)

  return (
    <div className="bg-white p-6 rounded-lg border shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Список студентів</h2>

      <div className="mb-4">
        <label className="text-gray-700 mr-2">Фільтр за рівнем:</label>
        <select className="border p-2 rounded" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {filteredStudents.map((student) => (
          <li
            key={student.id}
            className="p-3 border rounded-md flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Link href={`/teacher/students/${student.id}`} className="flex justify-between items-center w-full">
              <span className="font-medium">{student.name}</span>
              <span className="text-sm text-gray-500">{student.level}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

