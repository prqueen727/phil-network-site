/**
 * scheduler.ts — 네이버 자동발행 스케줄러 (Payload autoPublish.ts의 Supabase 이식본)
 * ═══════════════════════════════════════════════════════════════════════════
 *  Railway 상주 프로세스로 실행 (02 §7.2). 흐름:
 *   주기 폴링 → 일일 한도 확인 → 중복 확인 → geo 리라이팅 → saveBlogWithJsonLd 저장
 *
 *  jackskin 대비 변경점:
 *   - payload.find/create/findGlobal  →  supabase(service_role).from().select/insert
 *   - payload.create(blogs)           →  saveBlogWithJsonLd() (JSON-LD 자동 포함)
 *   - 크롤링/AI(fetchPostList·scrapePost·rewriteGeoArticle)는 geo-core 그대로 재사용 (05 참고)
 *
 *  실행: `node scheduler.js` (Railway). GEMINI_API_KEY·SUPABASE_SERVICE_ROLE_KEY 필요.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { serviceClient } from './supabase'
import { saveBlogWithJsonLd } from './saveBlogWithJsonLd'
// 05 네이버 리라이팅 참고구현의 순수함수 (크롤링·AI — 스택 무관, 그대로 재사용)
import { fetchPostList, scrapePost, rewriteGeoArticle } from './naver-core'

export function startScheduler() {
  const tick = () => runOnce().catch((e) => console.error('[auto-publish]', e.message))
  setTimeout(tick, 60_000)              // 최초 1분 뒤
  setInterval(tick, 60 * 60_000)        // 이후 매시간
  console.log('[auto-publish] scheduler armed (hourly poll)')
}

async function runOnce() {
  const sb = serviceClient()            // RLS 우회 (서버 전용)

  const { data: settings } = await sb.from('settings_autopublish').select('*').limit(1).single()
  if (!settings?.enabled) return
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[auto-publish] enabled but GEMINI_API_KEY missing — skipped'); return
  }

  const blogIds: string[] = (settings.naver_blog_ids ?? []).map((b: any) => b.blogId).filter(Boolean)
  if (blogIds.length === 0) return

  // 일일 한도: 오늘 자동발행(source_log_no 있는 글) 개수
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const { count: publishedToday } = await sb
    .from('blogs')
    .select('id', { count: 'exact', head: true })
    .not('source_log_no', 'is', null)
    .gte('created_at', today.toISOString())

  let remaining = (settings.daily_limit ?? 5) - (publishedToday ?? 0)
  if (remaining <= 0) return

  const logs: string[] = []
  for (const blogId of blogIds) {
    if (remaining <= 0) break
    const { posts } = await fetchPostList(blogId, 1)
    for (const post of posts) {
      if (remaining <= 0) break

      // 중복 방지: blogId:logNo
      const sourceLogNo = `${blogId}:${post.logNo}`
      const { data: dup } = await sb.from('blogs').select('id').eq('source_log_no', sourceLogNo).limit(1)
      if (dup && dup.length > 0) continue

      const scraped = await scrapePost(post.url)
      const article = await rewriteGeoArticle(scraped.title, scraped.markdown)  // Gemini

      // ★ 단일 진입점 — JSON-LD 자동 포함
      //
      // ⚠️ mode='auto'(즉시 발행)는 대표 이미지 가드에 막힌다 — 의도된 동작이다.
      //    크롤링은 이미지를 제외([05 부록 D-7])하므로 자동 초안에는 대표 이미지가 없고,
      //    대표 이미지 없이 발행하면 og:image·JSON-LD image가 빈 글이 쌓인다.
      //    → 권장 운영: mode='review'(draft)로 두고, 관리자가 대표 이미지를 지정해 발행.
      //    mode='auto'를 정말 쓰려면 settings_autopublish에 기본 대표 이미지(fallback)를
      //    지정해 아래 featuredImageId로 넘겨야 한다.
      await saveBlogWithJsonLd(sb, article, {
        authorId: settings.default_author_id,
        categoryId: settings.default_category_id,
        publish: settings.mode === 'auto',
        featuredImageId: settings.default_featured_image_id ?? undefined,
        sourceUrl: post.url,
        sourceLogNo,
      })

      // 용어사전 누적 (02 §2.7)
      for (const g of article.glossary ?? []) {
        const { data: exists } = await sb.from('glossary').select('id').eq('term', g.term).limit(1)
        if (!exists || exists.length === 0) {
          await sb.from('glossary').insert({
            term: g.term, one_liner: g.easy || g.definition, description: g.definition, is_published: false,
          })
        }
      }

      remaining--
      logs.push(`${sourceLogNo} → ${article.title} (${settings.mode})`)
    }
  }

  await sb.from('settings_autopublish').update({
    last_run_at: new Date().toISOString(),
    last_run_log: logs.length ? logs.join('\n') : '(새 글 없음)',
  }).eq('id', true)

  if (logs.length) console.log(`[auto-publish] ${logs.length} article(s) drafted`)
}
