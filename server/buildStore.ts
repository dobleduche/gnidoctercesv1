// server/buildStore.ts
import { supabaseAdmin } from './supabaseClient.js';
import type { BuildResult } from './orchestrator.js';

const BUCKET = 'build-artifacts';

export async function saveBuildResultToStore(
  result: BuildResult & {
    workspaceId: string;
    userId: string;
  }
) {
  // 1) upsert row in builds table
  const { error: dbError } = await supabaseAdmin.from('builds').upsert({
    id: result.buildId,
    workspace_id: result.workspaceId,
    user_id: result.userId,
    target: result.target,
    stack: result.stack,
    status: 'completed',
    summary: result.summary,
    preview_entry: result.previewEntry,
  });

  if (dbError) {
    console.error('Error upserting build row:', dbError);
    throw dbError;
  }

  // 2) upload files JSON to storage
  const payload = JSON.stringify(result.files, null, 2);

  const { error: storageError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(`builds/${result.buildId}.json`, payload, {
      contentType: 'application/json',
      upsert: true,
    });

  if (storageError) {
    console.error('Error uploading build files:', storageError);
    throw storageError;
  }
}

export async function getBuildResultFromStore(buildId: string) {
  // fetch build metadata
  const { data: buildRow, error: dbError } = await supabaseAdmin
    .from('builds')
    .select('*')
    .eq('id', buildId)
    .single();

  if (dbError || !buildRow) {
    return null;
  }

  // fetch files
  const { data, error: downloadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(`builds/${buildId}.json`);

  if (downloadError || !data) {
    console.error('Error downloading build files:', downloadError);
    return null;
  }

  const text = await data.text();
  const files = JSON.parse(text) as Record<string, string>;

  return {
    buildId,
    workspaceId: buildRow.workspace_id as string,
    userId: buildRow.user_id as string,
    target: buildRow.target as string,
    stack: buildRow.stack as string,
    summary: buildRow.summary as string,
    previewEntry: buildRow.preview_entry as string,
    files,
  };
}
