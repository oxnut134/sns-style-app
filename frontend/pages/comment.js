import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Message from "../components/message";
import { auth } from "./firebase";
import { useRouter } from "next/router";
import { useUser } from "./userContext";
import { useForm } from "react-hook-form"; //
import { onAuthStateChanged } from "firebase/auth";

export default function Comment(props) {
  const {
    //
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const loginUserName = useUser();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [comments, setComments] = useState([]);
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [userName, setUserName] = useState("");
  const commentLinkOnMessage = false;
  const cautionMessageOnSidebar = true;
  const sideBarTextBox = false;
  const [renderingOn, setRenderingOn] = useState(false);
  const [rerender, setRerender] = useState(0);
  const [displayLikes, setDisplayLikes] = useState([]);
  const [saveDb, setSaveDb] = useState(0);
  const [likes, setLikes] = useState(null);
  const [arrayOfTargetMessages, setArrayOfTargetMessages] = useState([]);
  const router = useRouter();
  const { id } = router.query; // id of target message/post
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  //-------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthChecking(false);
      } else {
        if (router.pathname !== "/login") {
          router.push("/login");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  //---------------------------------------------------
  const handleRemoveMessage = (id) => {
    setIsLoading(true);
    setShowWarning(true);
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id)
    );
    deleteStorageRecordById(id);
    setIsLoading(false);
    setShowWarning(false);
    router.push("/");
  };
  //---------------------------------------------------
  const deleteStorageRecordById = (idNO) => {
    const data = localStorage.getItem("storedMessages");
    if (data) {
      let records = JSON.parse(data);
      records = records.filter((record) => record.id !== idNO);
      localStorage.setItem("storedMessages", JSON.stringify(records));
    } else {
    }
  };
  //-------------------------------------------------
  const addStorageCommentsRecord = (newRecord) => {
    const data = localStorage.getItem("storedComments");
    const records = data ? JSON.parse(data) : [];
    records.push(newRecord);
    localStorage.setItem("storedComments", JSON.stringify(records));
    console.log(
      `新しいコメントレコードが追加されました: ${JSON.stringify(newRecord)}`
    );
  };

  //------------------------------------------------------
  const showStorage = () => {
    const storedMessagesJSON = localStorage.getItem("storedComments");
    const storedMessages = JSON.parse(storedMessagesJSON);
    console.log("stored to your storage:", storedMessages);
  };

  //-------------------------------------------
  const post_id = null;
  const handleRerender = (post_id) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== post_id)
    );
    setRerender(rerender + 1);
  };

  useEffect(() => {
    console.log("Updated rerender:", rerender);
  }, [rerender]);

  //------------------------------------------------------------
  const countLikes = async (message) => {
    if (isLoading) return;
    setIsLoading(true);

    message.isLikeClicked = true;
    const likeImageElement = document.getElementById(`likeImage-${message.id}`);
    if (message.lastMyLikeCount == 0) {
      message.lastMyLikeCount = 1;
      message.totalLikeCount += 1;
      likeImageElement.src = "http://localhost:3000/images/heartRed.png";
    } else {
      message.lastMyLikeCount = 0;
      message.totalLikeCount -= 1;
      likeImageElement.src = "http://localhost:3000/images/heart.png";
    }
    if (renderingOn == true) {
      setRenderingOn(false); //for message component
    } else {
      setRenderingOn(true);
    }

    setIsLoading(false);
  };

  //-----------------------------------------------------
  useEffect(() => {
    const getPost = async (id) => {
      setIsLoading(true);
      setShowWarning(true);
      const storedMessages = localStorage.getItem("storedMessages");
      let messagesArray = [];
      if (storedMessages) {
        messagesArray = JSON.parse(storedMessages);
      }

      const messagesSingle = messagesArray.filter(
        (message) => message.id == id
      );
      setMessages([...messagesSingle]);

      setIsLoading(false);
      setShowWarning(false);
    };
    getPost(id);
  }, []);

  //------------------------------------------------------------
  useEffect(() => {
    const getComments = async (e) => {
      setIsLoading(true);
      setShowWarning(true);
      console.log("id:", id);
      if (!id) return;

      const storedComments = localStorage.getItem("storedComments");
      let commentsArray = [];
      if (storedComments) {
        commentsArray = JSON.parse(storedComments);
      }

      const storedUsers = localStorage.getItem("storedUsers");
      let usersArray = [];
      if (storedUsers) {
        usersArray = JSON.parse(storedUsers);
      }
      const commentsFiltered = commentsArray.filter(
        (item) => item.post_id == id
      );
      const users = usersArray;
      const comments = commentsFiltered.map((item) => ({
        inputValue: item.comment,
        id: item.id,
        uid: item.uid,
        returnPostId: item.id,
        commentUserName:
          users.find((user) => user.uid === item.user_id)?.name || null,
      }));

      const reversedComments = comments.reverse();
      setComments(reversedComments);
      setIsLoading(false);
      setShowWarning(false);
    };

    getComments();
  }, []);

  //-------------------------------------------
  const handleSubmitComment = async (data) => {
    const { comment_input } = data;
    const { inputValue: currentInputValue } = { comment_input };
    
    if (!inputValue) {
      return;
    }
    if (isLoading) {
      setShowWarning(true);
      return;
    }
    setShowWarning(true);
    setIsLoading(true);

    const maxId =
      comments.length > 0 ? Math.max(...comments.map((msg) => msg.id)) : 0;
    const newComment = {
      inputValue: inputValue,
      id: maxId + 1,
      commentUserName: auth.currentUser?.displayName,
    };
    setComments((prev) => [newComment, ...prev]);
    setInputValue("");
    reset();

    try {
      const response = await fetch("http://localhost/api/add/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: id,
          user_id: auth.currentUser.uid,
          comment: newComment.inputValue,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("成功:", data);
        newComment.id = data.id;
        console.log("newComment:", newComment);

        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === newComment.id ? { ...comment, id: data.id } : comment
          )
        );

        newComment.comment = inputValue;
        newComment.id = data.id;
        newComment.post_id = id;
        newComment.uid = auth.currentUser.uid;

        addStorageCommentsRecord(newComment);
        showStorage();
      } else {
        const errorData = await response.json();
        console.error("エラー:", errorData);
      }
      setIsLoading(false);
      setShowWarning(false);
    } catch (error) {
      console.error("Error registering message:", error);
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
  };
 
  //------------------------------------------------
  useEffect(() => {
    setRenderingOn(false);
  }, []);
  //----------------------------------------------------
  if (isAuthChecking) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }
  //-----------------------------------------------
  return (
    <>
      <div className="index">
        <Sidebar
          register={register} 
          errors={errors}
          messages={messages}
          onChange={handleChange}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          cautionMessage={cautionMessageOnSidebar}
          sideBarTextBox={sideBarTextBox}
        />
        <div className="index_message_block">
          <div className="index_title">コメント</div>
          {messages.map((message, index) => (
            <div className="message" key={message.id}>
              <Message
                message={message}
                userName={userName}
                commentLink={commentLinkOnMessage}
                removeMessage={handleRemoveMessage}
                setRerender={handleRerender}
                isLoading={isLoading}
                showWarning={showWarning}
                setIsLoading={setIsLoading}
                setShowWarning={setShowWarning}
                displayLikes={displayLikes}
                setDisplayLikes={(value) => {
                  setDisplayLikes((prevLikes) => {
                    const newLikes = [...prevLikes];
                    newLikes[index] = value;
                    return newLikes;
                  });
                }}
                displayIndex={index}
                setLikes={setLikes}
                saveDb={saveDb}
                likes={likes}
                setSaveDb={setSaveDb}
                arrayOfTargetMessages={arrayOfTargetMessages}
                setArrayOfTargetMessages={setArrayOfTargetMessages}
                countLikes={countLikes}
              />
            </div>
          ))}
          <div className="comment">
            {comments.map((comment, index) => (
              <div key={`comment-${comment.id}-${index}`}>
                <div className="comment_title">コメント</div>
                <div className="comment_block">
                  <div className="comment_text_block">
                    <span className="comment_user">
                      {comment.commentUserName}
                    </span>
                  </div>
                  <div className="comment_text">{comment.inputValue}</div>
                </div>
              </div>
            ))}
            <form onSubmit={handleSubmit(handleSubmitComment)}>
              <div className="comment_input_wrapper">
                <input
                  {...register("comment_input", {
                    maxLength: {
                      value: 120,
                      message: "120文字以内で入力してください",
                    },
                  })}
                  type="text"
                  className="comment_input"
                  value={inputValue}
                  onChange={handleChange}
                />
                {errors.comment_input && (
                  <span
                    style={{ marginTop: "2%", color: "red", fontSize: "12px" }}
                  >
                    {errors.comment_input.message}
                  </span>
                )}
              </div>
              <div className="sidebar_button_block">
                <button
                  type="submit"
                  className="sidebar_share_button"
                  disabled={isLoading}
                >
                  コメント
                </button>
              </div>
            </form>
            {showWarning && !cautionMessageOnSidebar && (
              <div style={{ marginLeft: "2%", color: "red", fontSize: "12px" }}>
                処理中です！この表示が消えたら操作してください。
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .index {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          background-color: #000;
          border-left: 1px solid #fff;
        }
        /*-----------メッセージ----------------*/
        .index_title {
          margin: 2vh 2% 3vh 2%;
          font-size: 20px;
          display: flex;
        }
        .index_message_block {
          flex: 1; 
          min-width: 0; 
          padding: 1vh 0% 0vh 0%;
          color: #fff;
        }
         {
          /*-----------コメント---------------*/
        }
        .comment {
        }
        .comment_title {
          height: 5vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .comment_block {
          width: 100%;
          height: 10vh;
          background-color: #000;
          border-top: 1px solid #fff;
          border-bottom: 1px solid #fff;
          border-left: 1px solid #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .comment_text_block {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-left: 2%;
        }
        .comment_user {
          margin-top: -0.7vh;
          font-size: 14px;
        }
        .comment_text {
          margin: 1vh 0% 0vh 2%;
          font-size: 12px;
        }
        .comment_input_wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 2vh 0 0 0;
        }
        .comment_input {
          width: 95%;
          height: 5vh;
          padding-left: 2%;
          background-color: #000;
          border: 1px solid #fff;
          border-radius: 5px;
          color: #fff;
        }
        .sidebar_button_block {
          height: 6vh;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin: 2vh 0 0 0;
        }
        .sidebar_share_button {
          width: 15%;
          height: 100%;
          margin: 0% 0% 0% 0%;
          border-radius: 30px;
          background-color: #2d1792ff;
          color: #fff;
          box-shadow: -2px -2px 5px #888;
          font-size: 12px;
        }
      `}</style>
    </>
  );
}
