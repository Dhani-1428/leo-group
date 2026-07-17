interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, required, error, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-body-small font-medium text-foreground block">
        {label}
        {required && <span className="text-[#a85c5c] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-body-small text-[#707070]">{hint}</p>}
      {error && <p className="text-body-small text-[#a85c5c]">{error}</p>}
    </div>
  )
}
