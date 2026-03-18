"use client"

import { useTheme } from "next-themes"

export default function ThemeToggle(){

  const {theme,setTheme} = useTheme()

  return(

    <ThemeToggle/>

    <select
      onChange={e=>setTheme(e.target.value)}
    >

      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>

    </select>

  )
}
