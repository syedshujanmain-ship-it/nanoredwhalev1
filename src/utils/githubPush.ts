// Push source code to GitHub repo using Personal Access Token
// Uses Git Trees API for bulk upload (fast & reliable)
// Retry logic with exponential backoff

const GITHUB_API = 'https://api.github.com';

export interface PushResult {
  success: boolean;
  repoUrl?: string;
  message: string;
}

// Retry fetch with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    // Retry on rate limit (403) or server errors (5xx)
    if (res.status === 403 || res.status >= 500) {
      const errBody = await res.text().catch(() => '');
      if (errBody.includes('rate limit') || errBody.includes('abuse') || res.status >= 500) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
          continue;
        }
      }
    }
    return res;
  }
  return new Response('', { status: 500 });
}

export async function pushToGitHub(
  token: string,
  repoName: string,
  isPrivate: boolean,
  onProgress?: (msg: string, current: number, total: number) => void
): Promise<PushResult> {
  try {
    // 1. Verify token
    onProgress?.('Verifying GitHub token...', 1, 100);
    const userRes = await fetchWithRetry(`${GITHUB_API}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!userRes.ok) {
      const err = await userRes.json().catch(() => ({}));
      const msg = err.message || userRes.statusText;
      if (msg.includes('Bad credentials') || userRes.status === 401) {
        return {
          success: false,
          message: 'Invalid token. Go to github.com/settings/tokens/new and create a Classic Token with "repo" scope.',
        };
      }
      return { success: false, message: `Token error: ${msg}` };
    }
    const user = await userRes.json();
    const owner = user.login;

    // 2. Check/create repo
    onProgress?.('Checking repository...', 5, 100);
    const repoRes = await fetchWithRetry(`${GITHUB_API}/repos/${owner}/${repoName}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let branchName = 'main';
    let baseSha: string;

    if (repoRes.status === 404) {
      // Repo does not exist — create it with auto_init, then get the fresh ref
      onProgress?.('Creating repository...', 8, 100);
      const createRes = await fetchWithRetry(`${GITHUB_API}/user/repos`, {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          description: 'RED WHALE V1 by SHUJAN — Ultra-Intelligent Autonomous Development System',
          private: isPrivate,
          auto_init: true,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        let msg = err.message || createRes.statusText;
        if (
          createRes.status === 403 ||
          createRes.status === 404 ||
          msg.includes('Resource not accessible')
        ) {
          msg =
            'Token cannot create repos.\n\nSOLUTION:\n1. Go to github.com/settings/tokens/new\n2. Create a NEW Classic Token (NOT Fine-Grained)\n3. Check the "repo" scope\n4. Copy the token and paste it here.';
        }
        return { success: false, message: msg };
      }
      // Wait for GitHub to create the initial commit (critical!)
      onProgress?.('Waiting for GitHub to initialize repo...', 10, 100);
      await new Promise(r => setTimeout(r, 5000));

      // Fetch the fresh default branch ref
      let initRefRes = await fetchWithRetry(
        `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/main`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      if (!initRefRes.ok) {
        initRefRes = await fetchWithRetry(
          `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/master`,
          { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
        );
        if (initRefRes.ok) branchName = 'master';
      }
      if (!initRefRes.ok) {
        return { success: false, message: 'Repo created but no default branch found. Try again in a few seconds.' };
      }
      const initRefData = await initRefRes.json();
      baseSha = initRefData.object.sha;
    } else if (!repoRes.ok) {
      return { success: false, message: `Failed to check repo: ${repoRes.statusText}` };
    } else {
      // Repo exists — find default branch
      const repoData = await repoRes.json();
      branchName = repoData.default_branch || 'main';

      const refRes = await fetchWithRetry(
        `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/${branchName}`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      if (!refRes.ok) {
        // fallback to main/master
        const mainRes = await fetchWithRetry(
          `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/main`,
          { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
        );
        if (mainRes.ok) {
          branchName = 'main';
          const d = await mainRes.json();
          baseSha = d.object.sha;
        } else {
          const masterRes = await fetchWithRetry(
            `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/master`,
            { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
          );
          if (masterRes.ok) {
            branchName = 'master';
            const d = await masterRes.json();
            baseSha = d.object.sha;
          } else {
            return { success: false, message: 'Could not find main or master branch. Repository may be empty.' };
          }
        }
      } else {
        const d = await refRes.json();
        baseSha = d.object.sha;
      }
    }

    // 3. Load source files from app-source.json
    onProgress?.('Loading source files...', 12, 100);
    const sourceRes = await fetch('/app-source.json');
    if (!sourceRes.ok) {
      return {
        success: false,
        message: `Failed to load source files (${sourceRes.status}). Run "npm run build" first to generate app-source.json.`,
      };
    }
    const sourceData = await sourceRes.json();
    const allFiles = sourceData.files || [];
    const validFiles = allFiles.filter((f: any) => f.path && f.content != null);
    const totalFiles = validFiles.length;

    // 4. Get base tree SHA from the commit
    onProgress?.('Preparing upload...', 15, 100);
    const commitRes = await fetchWithRetry(
      `${GITHUB_API}/repos/${owner}/${repoName}/git/commits/${baseSha}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (!commitRes.ok) {
      return { success: false, message: 'Failed to get base commit.' };
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 5. Build tree entries
    const treeEntries = validFiles.map((file: any) => ({
      path: file.path.replace(/^red-whale-v1\//, ''),
      mode: '100644' as const,
      type: 'blob' as const,
      content: String(file.content),
    }));

    // 6. Create tree (GitHub allows up to ~500 entries; batch if needed)
    const BATCH_SIZE = 450;
    let currentTreeSha = baseTreeSha;
    const batches = Math.ceil(treeEntries.length / BATCH_SIZE);

    for (let b = 0; b < batches; b++) {
      const batch = treeEntries.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const pct = 20 + Math.round(((b + 1) / batches) * 55);
      onProgress?.(`Uploading batch ${b + 1}/${batches} (${batch.length} files)...`, pct, 100);

      const treeRes = await fetchWithRetry(
        `${GITHUB_API}/repos/${owner}/${repoName}/git/trees`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base_tree: currentTreeSha,
            tree: batch,
          }),
        }
      );

      if (!treeRes.ok) {
        const err = await treeRes.json().catch(() => ({}));
        return {
          success: false,
          message: `Tree upload failed: ${err.message || treeRes.statusText}`,
        };
      }

      const treeData = await treeRes.json();
      currentTreeSha = treeData.sha;
    }

    // 7. Create commit
    onProgress?.('Creating commit...', 80, 100);
    const newCommitRes = await fetchWithRetry(
      `${GITHUB_API}/repos/${owner}/${repoName}/git/commits`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Upload RED WHALE V1 — Full source code by SHUJAN',
          tree: currentTreeSha,
          parents: [baseSha],
        }),
      }
    );

    if (!newCommitRes.ok) {
      return { success: false, message: 'Failed to create commit.' };
    }
    const newCommitData = await newCommitRes.json();

    // 8. Update branch ref
    onProgress?.('Updating branch...', 90, 100);
    const updateRes = await fetchWithRetry(
      `${GITHUB_API}/repos/${owner}/${repoName}/git/refs/heads/${branchName}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sha: newCommitData.sha }),
      }
    );

    if (!updateRes.ok) {
      return { success: false, message: 'Failed to update branch reference.' };
    }

    // 9. VERIFY: poll GitHub until the commit is accessible on the branch
    onProgress?.('Verifying push on GitHub...', 95, 100);
    let verified = false;
    for (let v = 0; v < 10; v++) {
      await new Promise(r => setTimeout(r, 1000));
      const verifyRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repoName}/commits/${branchName}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (verifyRes.ok) {
        const vData = await verifyRes.json();
        if (vData.sha === newCommitData.sha) {
          verified = true;
          break;
        }
      }
    }

    if (!verified) {
      return {
        success: false,
        message: 'Push succeeded but GitHub has not indexed the commit yet. Wait 30 seconds and try deploying again.',
      };
    }

    onProgress?.('Complete!', 100, 100);

    const repoUrl = `https://github.com/${owner}/${repoName}`;
    return {
      success: true,
      repoUrl,
      message: `Successfully pushed all ${totalFiles} files to ${repoUrl}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`,
    };
  }
}
