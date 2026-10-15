import { useEffect, useId, useRef } from "react"

function useModalDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])
  return { ref, titleId }
}

export { useModalDialog }
