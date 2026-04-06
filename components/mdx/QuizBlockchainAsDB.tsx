'use client'

import { MultipleChoice } from './MultipleChoice'

export function QuizBlockchainAsDB({ id }: { id: string }) {
  return (
    <MultipleChoice
      id={id}
      question="In the 'blockchain as database' mental model, what replaces SQL queries and database schemas?"
      options={[
        "REST API endpoints and JSON schemas",
        "RPC calls and contract ABIs",
        "GraphQL resolvers and Prisma models",
        "WebSocket events and TypeScript interfaces"
      ]}
      correctAnswer="RPC calls and contract ABIs"
    />
  )
}
