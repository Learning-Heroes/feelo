import { ToastPill } from '@/features/discover/ToastPill'

interface SwipeToastProps {
  toast: { message: string; id: number } | null
}

// The pill is keyed on the toast id, so each new swipe remounts it and replays the entrance.
export function SwipeToast({ toast }: SwipeToastProps) {
  if (!toast) return null
  return <ToastPill key={toast.id} message={toast.message} />
}
