async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadIndex() {
  const container = document.getElementById('post-list');
  if (!container) return;
  const posts = await fetchJSON('/api/posts');
  if (!posts.length) {
    container.innerHTML = '<p>No posts yet.</p>';
    return;
  }
  const list = document.createElement('ul');
  posts.forEach(p => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `view.html?id=${p.id}`;
    link.textContent = p.title;
    li.appendChild(link);
    const edit = document.createElement('a');
    edit.href = `edit.html?id=${p.id}`;
    edit.textContent = ' (edit)';
    li.appendChild(edit);
    list.appendChild(li);
  });
  container.appendChild(list);
}

async function loadView() {
  const contentEl = document.getElementById('post-content');
  if (!contentEl) return;
  const id = getIdFromQuery() || window.location.pathname.split('/').pop();
  const post = await fetchJSON(`/api/posts/${id}`);
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('edit-link').href = `edit.html?id=${post.id}`;
  contentEl.innerHTML = marked.parse(post.content);
}

async function loadEdit() {
  const form = document.getElementById('post-form');
  if (!form) return;
  const id = getIdFromQuery() || window.location.pathname.split('/').pop();
  let post = { title: '', content: '' };
  if (id) {
    post = await fetchJSON(`/api/posts/${id}`);
    document.getElementById('page-title').textContent = 'Edit Post';
  }
  document.getElementById('title').value = post.title;
  document.getElementById('content').value = post.content;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const body = JSON.stringify({ id, title, content });
    const saved = await fetchJSON('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    window.location.href = `view.html?id=${saved.id}`;
  });
}

loadIndex();
loadView();
loadEdit();
