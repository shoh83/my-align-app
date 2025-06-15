// src/lib/db.js
import { neon } from "@neondatabase/serverless";

const pg = neon(process.env.DATABASE_URL);

/**
 * Save alignment record including usage metadata
 */
export async function saveAlignment({
  source,
  target,
  mapping,
  xliffHtml,
  usage,
}) {
  await pg`
    INSERT INTO alignments
      (source, target, mapping, xliff_html,
       prompt_token_count, candidates_token_count,
       thoughts_token_count, total_token_count)
    VALUES (
      ${source},
      ${target},
      ${JSON.stringify(mapping)},
      ${xliffHtml},
      ${usage.promptTokenCount},
      ${usage.candidatesTokenCount},
      ${usage.thoughtsTokenCount},
      ${usage.totalTokenCount}
    )
  `;
}
