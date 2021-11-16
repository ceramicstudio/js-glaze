export const parseContent = (content: string) => {
  return content == null ? null : JSON.parse(content)
}

export const parseControllers = (controllers: string | undefined): string[] | undefined => {
  if (controllers == null) {
    return undefined
  }
  return controllers.includes(',') ? controllers.split(',') : [controllers]
}
