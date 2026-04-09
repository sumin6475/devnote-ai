"use client"

// CodeBlock — Shiki syntax highlighting 컴포넌트

import React, { useEffect, useState } from "react"

export type CodeBlockProps = {
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={`flex w-full flex-col overflow-clip border rounded-xl ${className || ''}`}
      style={{
        borderColor: 'rgba(148, 163, 184, 0.12)',
        background: '#0F172A',
        color: '#E2E8F0',
        minHeight: 120,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  theme?: string
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlockCode({
  code,
  language = "javascript",
  theme = "github-dark",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>")
        return
      }
      const { codeToHtml } = await import("shiki")
      const html = await codeToHtml(code, { lang: language, theme })
      setHighlightedHtml(html)
    }
    highlight()
  }, [code, language, theme])

  // Shiki 테마가 pre에 인라인 배경색을 넣으므로 !important로 override
  const classNames = `w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4 [&>pre]:min-h-[80px] [&>pre]:!bg-[#0F172A] [&>pre]:m-0 ${className || ''}`

  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre><code>{code}</code></pre>
    </div>
  )
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>

function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
  return (
    <div className={`flex items-center justify-between ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock }
