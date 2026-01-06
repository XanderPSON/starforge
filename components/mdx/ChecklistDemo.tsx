'use client'

import { Checklist } from './Checklist'

export function ChecklistDemo({ id }: { id: string }) {
  return (
    <Checklist
      id={id}
      items={[
        "Read the documentation",
        "Try the interactive components",
        "Create your own codelab",
        "Test cross-tab synchronization",
        "Build something awesome!"
      ]}
    />
  )
}
