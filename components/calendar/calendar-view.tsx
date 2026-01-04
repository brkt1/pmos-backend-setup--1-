"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface Task {
  id: string
  title: string
  deadline: string
  status: string
  priority?: string
  projects?: { name: string } | null
  team_members?: { email: string; full_name: string | null } | null
}

export default function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.deadline)
      return isSameDay(taskDate, date)
    })
  }

  const priorityColors: Record<string, string> = {
    low: "bg-gray-400",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-600",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-gray-500",
    "in-progress": "bg-blue-500",
    completed: "bg-green-500",
    delayed: "bg-red-500",
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center sm:text-left">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="w-full sm:w-auto shrink-0">
            Today
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-1 sm:py-2">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days in month */}
          {daysInMonth.map((day) => {
            const dayTasks = getTasksForDate(day)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border rounded-lg p-1 sm:p-2 ${
                  isToday ? "bg-primary/10 border-primary" : "border-border"
                } ${!isCurrentMonth ? "opacity-50" : ""}`}
              >
                <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${isToday ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[80px]">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate ${
                        priorityColors[task.priority || "medium"] || "bg-blue-500"
                      } text-white`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-primary shrink-0"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-red-600 shrink-0"></div>
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-orange-500 shrink-0"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-blue-500 shrink-0"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-gray-400 shrink-0"></div>
            <span>Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

