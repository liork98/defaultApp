'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Mail, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error('GitHub login failed: ' + error.message)
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      toast.error('Login failed: ' + error.message)
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      toast.error('Signup failed: ' + error.message)
    } else {
      toast.success('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">LeetTracker</h1>
          <p className="text-muted-foreground">Sign in to sync your progress</p>
        </div>

        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="github" className="mt-4 space-y-4">
            <Button 
              onClick={handleGitHubLogin} 
              disabled={loading}
              variant="outline" 
              className="w-full h-12 gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              {loading ? 'Connecting...' : 'Continue with GitHub'}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Stay focused, stay persistent
            </span>
          </div>
        </div>

        <footer className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our terms of service.
        </footer>
      </motion.div>
    </div>
  )
}
