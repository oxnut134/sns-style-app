import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Message from "../components/message";
import { auth } from "./firebase";

const userName = auth.currentUser.displayName;

export default function Home({ Component, pageProps }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [postId, setPostId] = useState(null);
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [userName, setUserName] = useState(""); // ユーザー名を保持するためのステート

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setShowWarning(true);
      setIsLoading(true);

      if (user) {
        setUserName(user.displayName); // ログインしているユーザー名を設定
        //getPosts(); // ユーザーがログインしたらメッセージを取得
      } else {
        setUserName(""); // ログアウトした場合はユーザー名をクリア
      }
      setIsLoading(false);
      setShowWarning(false);
    });

    return () => unsubscribe(); // クリーンアップ関数
  }, []);

  useEffect(() => {
    const getPosts = async (e) => {
      //setShowWarning(true);
      setIsLoading(true);
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
          const posts = data;
          const messages = data.map((item) => ({
            inputValue: item.message,
            id: item.id - 1,
            returnPostId: item.id, // null で固定
          }));

          setMessages(messages); // messagesの状態を更新して再レンダリングをトリガー
          console.log("取得した投稿:", messages);
        } else {
          // エラーレスポンスの処理
          const errorData = await response.json();
          console.error("エラー:", errorData);
        }

        //alert("Message registered successfully!");
      } catch (error) {
        console.error("Error registering message:", error);
        //   alert(error.message);

        return;
      } finally {
        setIsLoading(false);
      }
    };

    getPosts();
  }, []); // messagesが更新されるたびにログを出力

  //-------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue) {
      return;
    }
    if (isLoading) {
      setShowWarning(true);
      return;
    }
    setShowWarning(true);
    setIsLoading(true);

    const newMessage = {
      inputValue: inputValue,
      id: messages.length,
      returnPostId: null,
    };
    setMessages([newMessage, ...messages]);
    setInputValue("");

    try {
      const response = await fetch("http://localhost/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: auth.currentUser.uid,
          message: newMessage.inputValue,
        }),
      });
      if (response.ok) {
        // レスポンスをJSONとしてパース
        const data = await response.json();
        console.log("成功:", data);
        // newMessageのreturnPostIdにデータを格納
        newMessage.returnPostId = data.post_id; // returnPostIdに値をセット
        console.log("newMessage:", newMessage);

        // messagesを更新
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === newMessage.id
              ? { ...message, returnPostId: data.post_id } // returnPostIdを更新
              : message
          )
        );
      } else {
        // エラーレスポンスの処理
        const errorData = await response.json();
        console.error("エラー:", errorData);
      }
      setIsLoading(false);
      setShowWarning(false);

      //alert("Message registered successfully!");
    } catch (error) {
      console.error("Error registering message:", error);
      //   alert(error.message);
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
  };
  // useEffect(() => {
  //   console.log("Updated messages:", messages);
  // }, [messages]); // messagesが更新されるたびにログを出力

  //----------------------------------------------------
  const handleDelete = async (id) => {
    if (isLoading) {
      setShowWarning(true);
      return;
    }
    setShowWarning(true);
    setIsLoading(true);

    const messageToDelete = messages.find((message) => message.id === id);
    console.log("messageToDelete:", messageToDelete);

    if (!messageToDelete || !messageToDelete.returnPostId) {
      console.error("Message to delete not found or post_id is null");
      return; // early return if message or post_id is not found
    }
    setMessages(messages.filter((message) => message.id !== id));

    try {
      //console.log("postId:", message.returnPostId);
      const response = await fetch("http://localhost/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: messageToDelete.returnPostId,
        }),
      });
      if (response.ok) {
        // レスポンスをJSONとしてパース
        const data = await response.json();
        console.log("成功:", data);
        setMessages(messages.filter((message) => message.id !== id));
      } else {
        // エラーレスポンスの処理
        const errorData = await response.json();
        console.error("エラー:", errorData);
        setMessages(messages.filter((message) => message.id !== id));
      }

      //alert("Message registered successfully!");
      setIsLoading(false);
      setShowWarning(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      //   alert(error.message);
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
  };
  return (
    <>
      <div className="index">
        {/*----- home ---------*/}
        <Sidebar
          inputValue={inputValue}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showWarning={showWarning}
        />
        <div className="index_message_block">
          <div className="index_title">ホーム</div>
          <Message
            messages={messages}
            onDelete={handleDelete}
            userName={userName}
          />
        </div>
      </div>
      {/* CSSスタイルは省略 */}
      <style jsx>{`
        .index {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          background-color: #000;
          border-left: 1px solid #fff;
        }
        .index_title {
          margin: 2vh 2% 3vh 2%;
          font-size: 18px;
          display: flex;
        }
        .index_message_block {
          width: 100%;
          padding: 1vh 0% 0vh 0%;
          color: #fff;
        }
      `}</style>
    </>
  );
}
