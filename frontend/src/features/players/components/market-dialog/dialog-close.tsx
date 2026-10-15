import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="absolute top-3 right-3"
      aria-label="Fechar"
      onClick={onClose}
    >
      <X />
    </Button>
  )
}

export { DialogClose }
