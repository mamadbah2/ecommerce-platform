import type { User as UserType, AuthSession } from "./types"
import { User } from "./models"
import connectDB from "./mongodb"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'une-phrase-secrete-pour-le-jwt'

export function generateToken(user: UserType): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  )
}

export async function login(email: string, password: string): Promise<AuthSession | null> {
  try {
    await connectDB()
    
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    })

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    // Convertir le document Mongoose en objet User
    const userObject: UserType = {
      id: user._id.toString(),
      email: user.email,
      password: '', // Ne pas inclure le mot de passe
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    const token = generateToken(userObject)
    const session: AuthSession = {
      user: userObject,
      token,
    }

    return session
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export function logout(token: string): void {
  // Avec JWT, pas besoin de stockage côté serveur
  // Le logout se fait côté client en supprimant le token
}

export async function getSession(token: string): Promise<AuthSession | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    await connectDB()
    const user = await User.findById(decoded.userId)
    
    if (!user || !user.isActive) {
      return null
    }

    const userObject: UserType = {
      id: user._id.toString(),
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    
    return {
      user: userObject,
      token
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth(token: string): Promise<AuthSession> {
  const session = await getSession(token)
  if (!session) {
    throw new Error("Authentication required")
  }
  return session
}

export async function requireRole(token: string, allowedRoles: string[]): Promise<AuthSession> {
  const session = await requireAuth(token)
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Insufficient permissions")
  }
  return session
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function createUser(userData: Omit<UserType, "id" | "createdAt" | "updatedAt">): Promise<UserType> {
  try {
    await connectDB()
    
    const hashedPassword = await hashPassword(userData.password)
    
    const newUser = new User({
      ...userData,
      password: hashedPassword,
      email: userData.email.toLowerCase()
    })
    
    const savedUser = await newUser.save()
    
    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      password: '', // Ne pas retourner le mot de passe
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      phone: savedUser.phone || '',
      address: savedUser.address || '',
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    }
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
}

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',

    ...options.headers
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })
}