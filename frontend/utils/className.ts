import { ClassNameValue, twMerge } from 'tailwind-merge';
export const cn = (...classLists: ClassNameValue[]) => {
  return twMerge(classLists);
}