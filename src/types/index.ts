/* eslint-disable @typescript-eslint/no-explicit-any */
// Rich text content from Tina CMS
export interface RichTextChild {
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  code?: boolean
  type?: string
  url?: string
  children?: RichTextChild[]
  [key: string]: any // For any other properties that might be present
}

export interface RichTextContent {
  type: string
  children: RichTextChild[]
  [key: string]: any // For any other properties that might be present
}

export interface Project {
  coverImage: any
  coverImageConfig: any
  id: string
  title: string
  slug: string
  order: number
  category: string
  titleKey?: string
  categoryKey?: string
  client?: string
  agency?: string
  year?: string
  creativeDirection?: string
  copyright?: string
  imageUrl?: string
  // Add any other properties you need
  description?: any
  description_de?: any
  description_en?: any
  title_de?: string
  title_en?: string
  title_bra?: string
  category_de?: string
  category_en?: string
  gallery?: Array<{
    src: string
    caption?: string
    caption_de?: string
    caption_en?: string
    featured?: boolean
  }>
}
