import Link from "next/link"
import { User } from "lucide-react"
import { CustomAvatar, CustomAvatarFallback } from "@/components/ui/custom-avatar"
import { CustomButton } from "@/components/ui/custom-button"

interface Student {
  id: number
  name: string
  englishLevel?: string
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

interface StudentsGridProps {
  students: Student[]
}

export function StudentsGrid({ students }: StudentsGridProps) {
  return (
    <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Ваші студенти</h2>
        <CustomButton variant="link" className="text-sm text-blue-500 shrink-0">
          <Link href="/teacher/students">
            Всі студенти
          </Link>
        </CustomButton>
      </div>
      <div className="space-y-3 overflow-auto flex-1 max-h-[400px]">
        {students.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Немає призначених студентів</p>
          </div>
        ) : (
          students.slice(0, 5).map((student) => (
            <Link
              key={student.id}
              href={``}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors border border-gray-100"
            >
              <CustomAvatar>
                <User className="h-6 w-6 text-gray-500" />
                <CustomAvatarFallback>{student.name.substring(0, 2).toUpperCase()}</CustomAvatarFallback>
              </CustomAvatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{student.name}</div>
                <div className="text-xs text-muted-foreground truncate">{student.email}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

