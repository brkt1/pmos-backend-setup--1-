"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface Strategy {
  id: string
  title: string
  priority: number
  metric_name: string | null
  metric_target: string | null
  risks: string[]
  active: boolean
  month_year: string
}

export default function StrategyList({ strategies }: { strategies: Strategy[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this strategy?")) return

    const supabase = createClient()
    const { error } = await supabase.from("strategies").delete().eq("id", id)

    if (!error) {
      router.refresh()
    }
  }

  if (strategies.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No strategies defined yet</p>
          <Button asChild>
            <Link href="/dashboard/strategy/new">Create Your First Strategy</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const priorityColors = {
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-yellow-500",
  }

  return (
    <div className="grid gap-4">
      {strategies.map((strategy) => (
        <Card key={strategy.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge className={priorityColors[strategy.priority as 1 | 2 | 3]}>Priority {strategy.priority}</Badge>
                <CardTitle className="text-xl">{strategy.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/strategy/${strategy.id}`}>Edit</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(strategy.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {strategy.metric_name && (
              <CardDescription>
                Metric: {strategy.metric_name} - Target: {strategy.metric_target}
              </CardDescription>
            )}
          </CardHeader>
          {strategy.risks.length > 0 && (
            <CardContent>
              <div>
                <h4 className="text-sm font-semibold mb-2">Risks to Watch:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {strategy.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
