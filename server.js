const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readPosts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function writePosts(posts) {
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2));
}

app.get('/api/posts', async (req, res) => {
  const posts = await readPosts();
  res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
  const posts = await readPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({error: 'Post not found'});
  }
  res.json(post);
});

app.post('/api/posts', async (req, res) => {
  const { id, title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }
  const posts = await readPosts();
  const date = new Date().toISOString();
  let post = posts.find(p => p.id === id);
  if (post) {
    post.title = title;
    post.content = content;
    post.date = date;
  } else {
    post = { id: Date.now().toString(), title, content, date };
    posts.push(post);
  }
  await writePosts(posts);
  res.json(post);
});

app.delete('/api/posts/:id', async (req, res) => {
  const posts = await readPosts();
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({error: 'Post not found'});
  }
  const [removed] = posts.splice(index, 1);
  await writePosts(posts);
  res.json(removed);
});

app.get('/view/:id', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

app.get('/edit/:id?', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'edit.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
