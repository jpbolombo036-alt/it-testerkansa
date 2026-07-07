import { Loader2 } from 'lucide-react'

export default function LoadingFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
    </div>
  )
}
