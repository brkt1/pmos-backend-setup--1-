import StrategyForm from "@/components/strategy/strategy-form"
import { requireManager } from "@/lib/utils/require-manager"

export default async function NewStrategyPage() {
  const user = await requireManager()

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Create Strategy</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Define a new strategic priority for the current period</p>
      </div>
      <StrategyForm userId={user.id} />
    </div>
  )
}
