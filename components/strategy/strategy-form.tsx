"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface StrategyFormProps {
  initialData?: {
    id?: string
    title?: string
    priority?: number
    metric_name?: string | null
    metric_target?: string | null
    risks?: string[]
    month_year?: string
  }
  userId: string
}

export default function StrategyForm({ initialData, userId }: StrategyFormProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const [title, setTitle] = useState(initialData?.title || "")
  const [priority, setPriority] = useState<string>(String(initialData?.priority || "1"))
  const [metricName, setMetricName] = useState(initialData?.metric_name || "")
  const [metricTarget, setMetricTarget] = useState(initialData?.metric_target || "")
  const [risks, setRisks] = useState<string[]>(initialData?.risks || [])
  const [newRisk, setNewRisk] = useState("")
  const [monthYear, setMonthYear] = useState(initialData?.month_year?.slice(0, 7) || currentMonth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAddRisk = () => {
    if (newRisk.trim()) {
      setRisks([...risks, newRisk.trim()])
      setNewRisk("")
    }
  }

  const handleRemoveRisk = (index: number) => {
    setRisks(risks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const strategyData = {
        user_id: userId,
        title,
        priority: Number.parseInt(priority),
        metric_name: metricName || null,
        metric_target: metricTarget || null,
        risks,
        month_year: `${monthYear}-01`,
        active: true,
      }

      if (initialData?.id) {
        const { error } = await supabase.from("strategies").update(strategyData).eq("id", initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("strategies").insert(strategyData)
        if (error) throw error
      }

      router.push("/dashboard/strategy")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Details</CardTitle>
            <CardDescription>Define your strategic priority and track its progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Strategy Title</Label>
              <Input
                id="title"
                placeholder="e.g., Improve sponsorship system"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Priority 1 (Highest)</SelectItem>
                  <SelectItem value="2">Priority 2</SelectItem>
                  <SelectItem value="3">Priority 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="month">Month/Year</Label>
              <Input
                id="month"
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metric</CardTitle>
            <CardDescription>Define a measurable outcome for this strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="metric-name">Metric Name</Label>
              <Input
                id="metric-name"
                placeholder="e.g., Monthly revenue"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="metric-target">Target Value</Label>
              <Input
                id="metric-target"
                placeholder="e.g., $50,000"
                value={metricTarget}
                onChange={(e) => setMetricTarget(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risks to Watch</CardTitle>
            <CardDescription>Identify potential obstacles or challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Add a risk..."
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddRisk()
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddRisk} className="w-full sm:w-auto shrink-0">
                  Add
                </Button>
              </div>
              {risks.length > 0 && (
                <div className="space-y-2">
                  {risks.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary p-3 rounded-md">
                      <span className="text-sm flex-1">{risk}</span>
                      <button type="button" onClick={() => handleRemoveRisk(index)} className="hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Saving..." : initialData?.id ? "Update Strategy" : "Create Strategy"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
