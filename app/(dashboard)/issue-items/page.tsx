"use client"

import { CreateIssueForm } from "@/components/issue-items/create-issue-form"

export default function IssueItemsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Issue Items</h1>
          <p className="text-muted-foreground mt-2">
            Issue items to customers without booking - Generate official receipt with signature
          </p>
        </div>

        <CreateIssueForm />
      </div>
    </div>
  )
}
