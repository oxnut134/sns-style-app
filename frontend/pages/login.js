import Header from "../components/header";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); //
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const [startInitLikeCount, setStartInitLikeCount] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //---------------------------------------------------------------------
  const showStorage = () => {
    const storedMessagesJSON = localStorage.getItem("storedComments");
    const storedMessages = JSON.parse(storedMessagesJSON);
    console.log("storedMessages:", storedMessages);
  };
  //-------------------------------------------------------------------
  const handleLogin = async (data) => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    setShowMessage(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log("ログイン成功");

      console.log("===========login start======================");

      const response = await fetch("http://localhost/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("APIエラー: " + response.statusText);
      }

      const responseData = await response.json();
      console.log("===========getPost start======================");

      const { messages, comments, users } = await getPosts();
      console.log("Loginで取得した投稿:", messages);
      console.log("===========initializeLike start======================");

      const tempMessages = await initializeLikeCount(messages);

      const reversedMessages = tempMessages.reverse();

      localStorage.setItem("storedMessages", JSON.stringify(reversedMessages));
      setMessages(reversedMessages);

      localStorage.setItem("storedComments", JSON.stringify(comments));
      console.log("Loginで取得したコメント:", comments);

      localStorage.setItem("storedUsers", JSON.stringify(users));
      console.log("Loginで取得したユーザー:", users);

      handleLoginSuccess();
    } catch (error) {
      console.error("ログインエラー:", error.message);
      setError("ログインに失敗しました: " + error.message);
    } finally {
      setIsLoading(false);
      setShowMessage(false);
    }
  };
  //-------------------------------------------------------------

  const handleLoginSuccess = () => {
    router.push("/");
  };
  useEffect(() => {
    setStartInitLikeCount(true);
  }, [messages]);

  //----------------------------------------------------------------------
  const initializeLikeCount = async (messages) => {
    console.log(" auth.currentUser.uid:", auth.currentUser.uid);
    try {
      const response = await fetch("http://localhost/api/set/likeCount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          login_user_id: auth.currentUser.uid,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("messagesにLike数セット成功:", data);
        return data.messages;
      } else {
        console.log("Like数取得エラー");
      }
    } catch (error) {
      console.error("エラー:", error);
    } finally {
    }
  };
  //------------------------------------------------------------------
  const getPosts = async (e) => {
    try {
      const response = await fetch("http://localhost/api/get/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("成功:", data);
        const posts = data.posts;
        const users = data.users;
        const comments = data.comments;
        console.log("post:", posts);
        console.log("comments:", comments);
        console.log("user:", users);
        const messages = posts.map((post) => {
          const user = users.find((user) => user.uid === post.user_id);
          return {
            inputValue: post.message,
            id: post.id,
            returnPostId: post.id,
            postUserName: user ? user.name : "Unknown",
            user_id: post.user_id,
            uid: post.user_id,
            totalLikeCount: post.totalMyLikeCount,
            firstMyLikeCount: post.firstMyLikeCount,
            lastMyLikeCount: post.lastMyLikeCount,
            isLikeClicked: post.isLikeClicked,
          };
        });
        console.log("****user:", messages);

        return { messages, comments, users };
      } else {
        const errorData = await response.json();
        console.error("エラー:", errorData);
      }
    } catch (error) {
      console.error("Error registering message:", error);

      return;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data) => {
    console.log("送信データ:", data);
  };
  //-----------------------------------------------------------------
  return (
    <>
      <div>
        <Header />
      </div>
      <div>
        <form className="login" onSubmit={handleSubmit(handleLogin)} noValidate>
          <div className="login_input_block">
            <div className="login_input_block_title">ログイン</div>
            <input
              {...register("email", {
                required: "メールアドレスを入力してください",
              })}
              type="text"
              className="login_input"
              placeholder="メールアドレス"
            />
            {errors.email && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.email.message}
              </span>
            )}
            <input
              {...register("password", {
                required: "パスワードを入力してください",
              })}
              type="password"
              className="login_input"
              placeholder="パスワード"
            />
            {errors.password && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.password.message}
              </span>
            )}
            <button type="submit" className="login_button">
              ログイン
            </button>
            {!error && showMessage && (
              <div
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  color: "red",
                  fontSize: "12px",
                }}
              >
                ログイン処理中です。しばらくお待ちください。
              </div>
            )}{" "}
            {error && <div className="error_message">{error}</div>}{" "}
          </div>
        </form>
      </div>
      <style jsx>
        {`
          .login {
            width: 100%;
            height: 90vh;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .login_input_block {
            width: 40%;
            height: 45vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #fff;
            border-radius: 5px;
          }
          .login_input_block_title {
            font-size: 20px;
            font-weight: bold;
          }
          .login_input {
            width: 75%;
            height: 7vh;
            margin: 4% 0% 0% 0%;
            padding-left: 2%;
            border: 2px solid #000;
            border-radius: 10px;
            font-size: 17px;
          }
          .login_button {
            width: 27%;
            height: 7vh;
            margin: 4% 0% 0% 0%;
            border: 2px solid #000;
            border-radius: 30px;
            background-color: #2d1792ff;
            color: #fff;
            font-size: 15px;
          }
          .error_message {
            margin-top: 10px;
            margin-bottom: 10px;
            color: red;
            font-size: 10px;
          }
        `}
      </style>
    </>
  );
}
