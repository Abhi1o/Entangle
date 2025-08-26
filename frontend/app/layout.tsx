import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from 'next/font/google';
import "./globals.css"
// import '../lib/wdyr'

import { Providers } from "@/components/providers/para-provider";


const dm_sans = DM_Sans({ subsets: ["latin"],  variable: '--font-dm-sans', })

export const metadata: Metadata = {
  title: "Carpe Tempus - Trade Your Time",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className={dm_sans.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
