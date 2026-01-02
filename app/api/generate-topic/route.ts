import { generateText } from "ai"

export async function POST(req: Request) {
  const { title, memo } = await req.json()

  const { text } = await generateText({
    model: "openai/gpt-5-mini",
    prompt: `以下のトピックに関する論点をまとめたレポートをマークダウン形式で生成してください。
デザインはグレーと黒のみを使用し、青、紫、緑などの色は使わないでください。
シンプルで読みやすい構造にしてください。

タイトル: ${title}
メモ: ${memo}

以下の構成でレポートを作成してください：
1. 概要
2. 主要な論点（3-4個）
3. まとめ

マークダウン形式で出力してください。`,
    maxOutputTokens: 2000,
  })

  // Convert markdown to simple HTML with grayscale styling
  const html = convertMarkdownToHTML(text)

  return Response.json({ html })
}

function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-4 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-6 text-foreground">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-2 text-muted-foreground">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2 text-muted-foreground">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, "</p><p class='mb-4 text-foreground leading-relaxed'>")

  // Wrap in paragraph tags
  html = `<p class="mb-4 text-foreground leading-relaxed">${html}</p>`

  // Wrap lists in ul tags
  html = html.replace(/(<li.*?<\/li>\n?)+/gs, "<ul class='list-disc mb-4'>$&</ul>")

  return html
}
