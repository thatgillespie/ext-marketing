"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProjectForm } from "./project-form"

interface ProjectEditModalProps {
  project: {
    id: string
    name: string
    description?: string
    companyId: string
    status: string
    priority: string
    startDate?: number
    endDate?: number
    budget?: number
    estimatedHours?: number
    color?: string
  }
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProjectEditModal({ project, open, onClose, onSuccess }: ProjectEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-6">
          <ProjectForm
            initialData={{
              ...project,
              startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined,
              endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : undefined,
            }}
            onSuccess={() => {
              onSuccess()
              onClose()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
