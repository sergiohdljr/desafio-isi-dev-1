import { Checkbox } from "@/components/ui/checkbox"

function TypeFilter({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex h-8 items-center gap-2 rounded-md px-2 text-body-sm">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      {label}
    </label>
  )
}

export { TypeFilter }
