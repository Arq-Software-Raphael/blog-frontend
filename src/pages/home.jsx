import React, { useState, useEffect } from "react";
import Header from "../components/Header/index";
import '../App.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [username, setUsername] = useState("Usuário");

  const defaultUserImg = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:8000/api/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUsername(res.data.name); 
      })
      .catch((err) => {
        console.error("Erro ao buscar usuário:", err);
        navigate("/login");
      });

    axios
      .get("http://localhost:8001/api/posts/")
      .then((res) => {
        const loadedPosts = res.data;
        Promise.all(
          loadedPosts.map((post) =>
            axios
              .get(`http://localhost:8002/api/comments/?post_id=${post.id}`)
              .then((commentsRes) => ({
                ...post,
                comments: commentsRes.data,
              }))
              .catch(() => ({
                ...post,
                comments: [],
              }))
          )
        ).then((postsWithComments) => {
          setPosts(postsWithComments);
        });
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNewPostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const formData = new FormData();
    formData.append("content", newPostContent);
    formData.append("title", "meu titulo");
    formData.append("author", username);
    if (newPostImage) {
      formData.append("image", newPostImage);
    }

    axios
      .post("http://localhost:8001/api/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
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
        post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
      )
    );
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs({ ...commentInputs, [postId]: text });
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    const formData = new FormData();
    formData.append("post_id", postId);
    formData.append("user_id", username);
    formData.append("content", commentText);

    axios
      .post("http://localhost:8002/api/comments/", formData)
      .then((response) => {
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...(Array.isArray(post.comments) ? post.comments : []),
                    {
                      id: response.data.id,
                      user_id: username,
                      content: commentText,
                    },
                  ],
                }
              : post
          )
        );
        setCommentInputs({ ...commentInputs, [postId]: "" });
      })
      .catch((err) => console.error("Erro ao comentar:", err));
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="blog-container">
        <div className="new-post">
          <form onSubmit={handleNewPostSubmit} encType="multipart/form-data">
            <textarea
              name="content"
              className="post-textarea"
              rows="3"
              placeholder="No que você está pensando?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <input
              type="file"
              name="image"
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
                    src={defaultUserImg} // sempre a imagem padrão
                    className="profile-img"
                    alt={post.author}
                  />
                  <div>
                    <strong>{post.author}</strong>
                    <br />
                    <small className="post-date">
                      {new Date(post.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>

                <p className="post-text">{post.content}</p>

                {post.image && (
                  <a href={post.image} target="_blank" rel="noopener noreferrer">
                    <img src={post.image} className="post-img" alt="Post" />
                  </a>
                )}

                <div className="post-actions">
                  <button type="button" className="icon-button" onClick={() => handleLike(post.id)}>
                    <span className="material-symbols-outlined">thumb_up</span> {post.likes || 0}
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
                      onChange={(e) =>
                        handleCommentChange(post.id, e.target.value)
                      }
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
