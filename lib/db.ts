export interface User {
  id: string; email: string; name: string; avatar?: string
  role: 'merchant' | 'admin'; emailVerified: boolean
  verifyToken?: string; verifyTokenExp?: string; createdAt: string
}

export interface Post {
  id: string; title: string; description: string
  category: 'dev' | 'design' | 'engineer' | 'video' | '3d' | 'other'
  images: string[]; link: string; rate: string
  rateType: 'hourly' | 'project' | 'open' | 'hide'
  authorId: string; authorName: string; authorRole: string
  authorAvatar?: string; createdAt: string; views: number
}

export interface Message {
  id: string; postId: string; fromName: string; fromEmail: string
  message: string; budget?: string; toAuthorId: string; createdAt: string
}

const store = {
  users: new Map<string, User>(),
  posts: new Map<string, Post>(),
  messages: new Map<string, Message>(),
}

const SEED: Post[] = [
  { id:'post-001', title:'Full-Stack E-Commerce Platform', description:'Multi-vendor marketplace with Node.js, React, Stripe. 10k+ daily transactions with real-time inventory.', category:'dev', images:[], link:'https://github.com/ATHEL204', rate:'$85', rateType:'hourly', authorId:'s1', authorName:'ATHEL204', authorRole:'Full-Stack Developer', createdAt:new Date(Date.now()-7200000).toISOString(), views:142 },
  { id:'post-002', title:'Brand Identity — Lagos Streetwear', description:'Complete brand system: logo, palette, typography, packaging for an independent fashion label.', category:'design', images:[], link:'https://behance.net', rate:'Open to offers', rateType:'open', authorId:'s2', authorName:'Amara D.', authorRole:'Brand Designer', createdAt:new Date(Date.now()-18000000).toISOString(), views:89 },
  { id:'post-003', title:'Mechanical Engineering CAD Models', description:'Precision CAD for industrial components. SolidWorks / AutoCAD. Available for freelance.', category:'engineer', images:[], link:'', rate:'$60', rateType:'hourly', authorId:'s3', authorName:'Kofi A.', authorRole:'Mechanical Engineer', createdAt:new Date(Date.now()-28800000).toISOString(), views:54 },
  { id:'post-004', title:'Cinematic Brand Video Production', description:'Short-form brand videos, product showcases, social content. 4K equipment, colour grading included.', category:'video', images:[], link:'https://youtube.com', rate:'$500', rateType:'project', authorId:'s4', authorName:'Maya R.', authorRole:'Videographer', createdAt:new Date(Date.now()-43200000).toISOString(), views:201 },
  { id:'post-005', title:'Blender 3D Characters & Environments', description:'Game-ready 3D assets, character rigs, environment design. Unreal Engine 5 compatible.', category:'3d', images:[], link:'https://artstation.com', rate:'$75', rateType:'hourly', authorId:'s5', authorName:'Yuki T.', authorRole:'3D Artist', createdAt:new Date(Date.now()-64800000).toISOString(), views:178 },
  { id:'post-006', title:'Web3 Smart Contract Development', description:'Solidity contracts, DeFi protocol integration, on-chain analytics dashboards. Base & Ethereum.', category:'dev', images:[], link:'https://github.com', rate:'$120', rateType:'hourly', authorId:'s6', authorName:'James O.', authorRole:'Web3 Developer', createdAt:new Date(Date.now()-86400000).toISOString(), views:312 },
]

if (store.posts.size === 0) SEED.forEach(p => store.posts.set(p.id, p))

export const db = {
  createUser: (u: User) => { store.users.set(u.id, u); return u },
  getUserById: (id: string) => store.users.get(id) || null,
  getUserByEmail: (email: string) => [...store.users.values()].find(u => u.email === email.toLowerCase()) || null,
  updateUser: (id: string, fields: Partial<User>) => {
    const u = store.users.get(id); if (!u) return null
    const updated = { ...u, ...fields }; store.users.set(id, updated); return updated
  },
  getAllPosts: (category?: string) => {
    const posts = [...store.posts.values()].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return category ? posts.filter(p => p.category === category) : posts
  },
  getPostById: (id: string) => store.posts.get(id) || null,
  createPost: (p: Post) => { store.posts.set(p.id, p); return p },
  deletePost: (id: string) => store.posts.delete(id),
  getPostsByAuthor: (authorId: string) => [...store.posts.values()].filter(p => p.authorId === authorId),
  incrementViews: (id: string) => { const p = store.posts.get(id); if(p) store.posts.set(id,{...p,views:p.views+1}) },
  createMessage: (m: Message) => { store.messages.set(m.id, m); return m },
  getStats: () => {
    const posts = [...store.posts.values()]
    return { totalPosts: posts.length, totalCreators: new Set(posts.map(p=>p.authorId)).size, totalCategories: new Set(posts.map(p=>p.category)).size }
  },
}
