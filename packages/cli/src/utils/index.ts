export const parseControllers = (controllers: string): Array<string> => {
  const result: Array<string> = controllers.includes(',') ? controllers.split(',') : [controllers]
  return result
}
