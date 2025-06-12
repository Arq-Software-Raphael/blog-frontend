import React, { useState,useEffect } from "react";
import Header from "../components/Header/index";
import '../App.css'
import axios from "axios";

const initialPosts = [
  {
    id: 1,
    username: "Nome",
    userImg:
      "https://www.reporterdiario.com.br/wp-content/uploads/2024/09/a-era-do-gelo.png",
    date: "Data",
    content: "Descrição",
    postImg:
      "https://www.reporterdiario.com.br/wp-content/uploads/2024/09/a-era-do-gelo.png",
    likes: 0,
    comments: [
      { id: 1, author: "Fulano", text: "Comentario comentario comentario" },
      { id: 2, author: "Fulano", text: "okookokoko" },
    ],
  },
];

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  // Comentários controlados por post id

  // Usuário fixo (sem autenticação)
  const username = "Usuario";

  const handleNewPostSubmit = (e) => {
  e.preventDefault();
  if (!newPostContent.trim()) return;

  const formData = new FormData();
  formData.append("content", newPostContent);
  formData.append("title",'meu titulo')
  //if (newPostImage) formData.append("image", newPostImage);
  formData.append("author", username);  

  axios
    .post("http://localhost:8001/api/posts/", formData)
    .then((response) => {
      setPosts([response.data, ...posts]);
      setNewPostContent("");
      setNewPostImage(null);
    })
    .catch((error) => {
      console.error("Erro ao criar post:", error);
    });
  };


  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs({ ...commentInputs, [postId]: text });
  };

  
  const userId = 1;

  const handleCommentSubmit = (e, postId) => { 
  e.preventDefault();
  const commentText = commentInputs[postId];
  if (!commentText || !commentText.trim()) return;

  const formData = new FormData();
  formData.append("post_id", postId);
  formData.append("user_id", userId);
  formData.append("content", commentText);

  axios
    .post("http://localhost:8002/api/comments/", formData)
    .then(() => {
    setPosts(
      posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...(Array.isArray(post.comments) ? post.comments : []),
              { id: Date.now(), user: username, content: commentText },
            ],
          }
        : post
    )
  );
  setCommentInputs({ ...commentInputs, [postId]: "" });
});
};

useEffect(() => {
  axios.get("http://localhost:8001/api/posts/")
    .then((res) => {
      const loadedPosts = res.data;

      Promise.all(
        loadedPosts.map(post =>
          axios.get(`http://localhost:8002/api/comments/?post_id=${post.id}`)
            .then(commentsRes => ({
              ...post,
              comments: commentsRes.data,
            }))
            .catch(() => ({
              ...post,
              comments: [],
            }))
        )
      ).then(postsWithComments => {
        setPosts(postsWithComments);
      });
    })
    .catch((err) => console.error(err));
}, []);

  return (
    <>
      <Header />
      <div className="blog-container">
  <div className="new-post">
    <form onSubmit={handleNewPostSubmit} encType="multipart/form-data">
      <textarea
        name="conteudo"
        className="post-textarea"
        rows="3"
        placeholder="No que você está pensando?"
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)}
      ></textarea>
      <input
        type="file"
        name="imagem"
        className="post-image-input"
        onChange={(e) => setNewPostImage(e.target.files[0])}
      />
      <div className="post-submit">
        <button type="submit" className="btn-publicar">
          Publicar
        </button>
      </div>
    </form>
  </div>

  <div className="post-feed">
    {posts && posts.length > 0 ? (
      posts.map((post) => (
        <div className="post-card" key={post.id}>
          <div className="post-header">
            <img
              src={post.userImg}
              className="profile-img"
              alt={post.username}
            />
            <div>
              <strong>{post.username}</strong>
              <br />
              <small className="post-date">{post.date}</small>
            </div>
          </div>

          <p className="post-text">{post.content}</p>

          {post.postImg && (
            <a href={post.postImg} target="_blank" rel="noopener noreferrer">
              <img src={post.postImg} className="post-img" alt="Post" />
            </a>
          )}

          <div className="post-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => handleLike(post.id)}
            >
              <span className="material-symbols-outlined">thumb_up</span>{" "}
              {post.likes}
            </button>
          </div>

          <div className="post-comments">
            {post.comments && post.comments.length > 0 && (
              <div>
                {post.comments.map((comment) => (
                  <p key={comment.id}>
                    <strong>{comment.user_id}:</strong> {comment.content}
                  </p>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => handleCommentSubmit(e, post.id)}
              className="comment-form"
            >
              <input
                type="text"
                name="comment_text"
                placeholder="Escreva um comentário..."
                className="comment-input"
                value={commentInputs[post.id] || ""}
                onChange={(e) => handleCommentChange(post.id, e.target.value)}
              />
              <button type="submit" className="btn-comment">
                Comentar
              </button>
            </form>
          </div>
        </div>
      ))
    ) : (
      <p>Nenhum post encontrado.</p>
    )}
  </div>
</div>


    </>
  );
};

export default Feed;
