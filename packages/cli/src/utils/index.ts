export const parseContent = (content: string): Record<string, unknown> | undefined => {
  const result: Record<string, unknown> | undefined =
    content === undefined ? undefined : (JSON.parse(content) as Record<string, unknown>)
  return result
}

export const parseControllers = (controllers: string): Array<string> => {
  const result: Array<string> = controllers.includes(',') ? controllers.split(',') : [controllers]
  return result
}
