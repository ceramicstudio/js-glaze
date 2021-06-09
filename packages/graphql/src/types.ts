export type Doc<Content = Record<string, any>> = {
  content: Content
  id?: string
  schema?: string
}
