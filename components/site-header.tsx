'use client'


import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

const navLinks = [
  { href: '/', label: 'خانه' },
  { href: '/#jobs', label: 'فرصت‌های شغلی' },
  { href: '/#categories', label: 'دسته‌بندی‌ها' },
  { href: '/company', label: 'پنل کارفرما' },
  { href: '/applicant', label: 'پنل کارجو' },
  { href: '/marketplace/register', label: 'بازارچه شهرکار' },
]

export function SiteHeader() {


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="شهرکار">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
  <Link
    key={link.href}
    href={link.href}
    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  >
    {link.label}
  </Link>
))}
            
              
                        
           
          
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
        <Button
  variant="ghost"
  size="lg"
  nativeButton={false}
  render={<Link href="/login">ورود</Link>}
/>

<Button
  size="lg"
  nativeButton={false}
className="register-glow rounded-2xl px-8 py-3 text-lg font-extrabold text-black transition-all hover:scale-110"
  render={<Link href="/register">ثبت‌نام</Link>}
/>

        </div>

<div className="flex items-center gap-2 lg:hidden">

<Button
  variant="ghost"
  size="sm"
  nativeButton={false}
  render={<Link href="/login">ورود</Link>}
/>


<Button
  size="sm"
  nativeButton={false}
className="register-glow rounded-2xl px-6 py-3 text-base font-extrabold text-black transition-all hover:scale-110"
  render={<Link href="/register">ثبت‌نام</Link>}
/>


</div>      

      </div>

            
    </header>
  )
}


