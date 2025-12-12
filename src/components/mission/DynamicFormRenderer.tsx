'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/types'
import { useState } from 'react'

interface DynamicFormRendererProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  initialData?: Record<string, any>
  isReadOnly?: boolean
}

export function DynamicFormRenderer({
  fields,
  onSubmit,
  initialData = {},
  isReadOnly = false
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label}은(는) 필수 입력 항목입니다.`
    }
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) newErrors[field.id] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id]
    const error = errors[field.id]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'url':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="url"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={value || ''}
              onValueChange={(val) => handleFieldChange(field.id, val)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || '선택해주세요'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => {
                const files = e.target.files
                if (files) {
                  handleFieldChange(field.id, Array.from(files))
                }
              }}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="date"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={isReadOnly}
              className={error ? 'border-red-500' : ''}
            />
            {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(renderField)}

      {!isReadOnly && (
        <Button type="submit" className="w-full">
          제출하기
        </Button>
      )}
    </form>
  )
}
