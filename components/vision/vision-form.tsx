"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface VisionFormProps {
  initialData: {
    id?: string
    long_term_goal?: string
    core_values?: string[]
    non_negotiables?: string[]
  } | null
  userId: string
}

export default function VisionForm({ initialData, userId }: VisionFormProps) {
  const [longTermGoal, setLongTermGoal] = useState(initialData?.long_term_goal || "")
  const [coreValues, setCoreValues] = useState<string[]>(initialData?.core_values || [])
  const [nonNegotiables, setNonNegotiables] = useState<string[]>(initialData?.non_negotiables || [])
  const [newValue, setNewValue] = useState("")
  const [newNonNegotiable, setNewNonNegotiable] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAddValue = () => {
    if (newValue.trim()) {
      setCoreValues([...coreValues, newValue.trim()])
      setNewValue("")
    }
  }

  const handleRemoveValue = (index: number) => {
    setCoreValues(coreValues.filter((_, i) => i !== index))
  }

  const handleAddNonNegotiable = () => {
    if (newNonNegotiable.trim()) {
      setNonNegotiables([...nonNegotiables, newNonNegotiable.trim()])
      setNewNonNegotiable("")
    }
  }

  const handleRemoveNonNegotiable = (index: number) => {
    setNonNegotiables(nonNegotiables.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const visionData = {
        user_id: userId,
        long_term_goal: longTermGoal,
        core_values: coreValues,
        non_negotiables: nonNegotiables,
      }

      if (initialData?.id) {
        const { error } = await supabase.from("vision").update(visionData).eq("id", initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("vision").insert(visionData)
        if (error) throw error
      }

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
            <CardTitle>Long-Term Goal</CardTitle>
            <CardDescription>What do you want to achieve in the next 5-10 years?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Become a high-level manager and strategist..."
              value={longTermGoal}
              onChange={(e) => setLongTermGoal(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Values</CardTitle>
            <CardDescription>The principles that guide your decisions and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a core value..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddValue()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddValue}>
                  Add
                </Button>
              </div>
              {coreValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coreValues.map((value, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md"
                    >
                      <span className="text-sm">{value}</span>
                      <button type="button" onClick={() => handleRemoveValue(index)} className="hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Non-Negotiables</CardTitle>
            <CardDescription>The lines you will never cross, regardless of pressure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a non-negotiable..."
                  value={newNonNegotiable}
                  onChange={(e) => setNewNonNegotiable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddNonNegotiable()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddNonNegotiable}>
                  Add
                </Button>
              </div>
              {nonNegotiables.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nonNegotiables.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNonNegotiable(index)}
                        className="hover:text-destructive"
                      >
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

        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData?.id ? "Update Vision" : "Create Vision"}
        </Button>
      </div>
    </form>
  )
}
