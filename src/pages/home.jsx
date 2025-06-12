import React, { useState, useEffect } from "react";
import Header from "../components/Header/index";
import "../App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [username, setUsername] = useState("Usuário");
  const [userId, setUserId] = useState(null);

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
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.name);
        setUserId(res.data.id);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    async function fetchPostsAndComments() {
      try {
        const postsRes = await axios.get("http://localhost:8001/api/posts/");
        const loadedPosts = postsRes.data;

        const postsWithComments = await Promise.all(
          loadedPosts.map(async (post) => {
            try {
              const commentsRes = await axios.get(
                `http://localhost:8002/api/comments/?post_id=${post.id}`
              );
              return {
                ...post,
                comments: Array.isArray(commentsRes.data) ? commentsRes.data : [],
              };
            } catch {
              return {
                ...post,
                comments: [],
              };
            }
          })
        );

        setPosts(postsWithComments);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        setPosts([]);
      }
    }

    fetchPostsAndComments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const formData = new FormData();
    formData.append("content", newPostContent);
    formData.append("title", "meu titulo");
    formData.append("author", username);
    if (newPostImage) {
      formData.append("image", newPostImage);
    }

    try {
      const response = await axios.post("http://localhost:8001/api/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts([{ ...response.data, comments: [] }, ...posts]);
      setNewPostContent("");
      setNewPostImage(null);
    } catch (error) {
      console.error("Erro ao publicar post:", error);
    }
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

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;
    if (!userId) return;

    const formData = new FormData();
    formData.append("post_id", postId);
    formData.append("user_id", userId);
    formData.append("content", commentText);

    try {
      const response = await axios.post("http://localhost:8002/api/comments/", formData);

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), response.data],
              }
            : post
        )
      );
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    }
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: 10 }}>
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
              rows={3}
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
          {posts.length > 0 ? (
            posts.map((post) => (
              <div className="post-card" key={post.id}>
                <div className="post-header">
                  <img
                    src={defaultUserImg}
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
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => handleLike(post.id)}
                  >
                    <span className="material-symbols-outlined">thumb_up</span>{" "}
                    {post.likes || 0}
                  </button>
                </div>

                <div className="post-comments">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <p key={comment.id}>
                        <strong>Usuário {comment.user_id}:</strong> {comment.content}
                      </p>
                    ))
                  ) : (
                    <p className="no-comments">Seja o primeiro a comentar!</p>
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
