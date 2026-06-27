// lib/types.ts

export type Category = 'dev' | 'design' | 'engineer' | 'video' | '3d' | 'other'
export type RateType = 'hourly' | 'project' | 'open' | 'hide'

export interface Author {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
}

export interface Post {
  id: string
  title: string
  description: string
  category: Category
  images: string[]        // base64 or URLs
  link: string
  rate: string
  rateType: RateType
  author: Author
  createdAt: string
  views: number
}

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  emailVerified: boolean
}

export interface ContactMessage {
  id: string
  postId: string
  postTitle: string
  fromName: string
  fromEmail: string
  toName: string
  toEmail: string
  message: string
  budget: string
  createdAt: string
}

export interface CategoryConfig {
  id: Category
  label: string
  icon: string
  color: string
  bgClass: string
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'dev',      label: 'Developer',  icon: '💻', color: '#00E5FF', bgClass: 'cat-dev'      },
  { id: 'design',   label: 'Designer',   icon: '🎨', color: '#9D6FFF', bgClass: 'cat-design'   },
  { id: 'engineer', label: 'Engineer',   icon: '⚙️', color: '#FF8C42', bgClass: 'cat-engineer' },
  { id: 'video',    label: 'Video/Film', icon: '🎬', color: '#FF3B5C', bgClass: 'cat-video'    },
  { id: '3d',       label: '3D / Art',   icon: '🧊', color: '#00FF88', bgClass: 'cat-3d'       },
  { id: 'other',    label: 'Other',      icon: '✦',  color: '#FF6B9D', bgClass: 'cat-other'    },
]
