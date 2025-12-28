import { useState, useEffect } from "react";
import { auth } from "../pages/firebase";
const Message = ({
  message,
  commentLink,
  removeMessage,
  isLoading,
  setIsLoading,
  setShowWarning,
  countLikes,
  renderingOn,
  handleTransition,
}) => {

 
  //-------------------------------------------------------
  const [rendering, setRendering] = useState(false);

  const renderingSw = () => {
    setRendering((prev) => !prev);
  };
  useEffect(() => {
    renderingSw();
  }, [renderingOn]);

  const showStorage = () => {
    const storedMessagesJSON = localStorage.getItem("storedMessages");
    const storedMessages = JSON.parse(storedMessagesJSON);
    console.log("Stored Messages:", storedMessages);
  };

  //-----------------------------------------------------------
  const handleDelete = async (id) => {
    if (isLoading) {
      return;
    }
  
    setShowWarning(true);
    setIsLoading(true);

    const messageToDelete = message;
    try {
      const response = await fetch("http://localhost/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: message.id,
          user_id: auth.currentUser.uid,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("成功:", data);

        removeMessage(message.id);

  
        setShowWarning(false);
        setIsLoading(false);
      } else {
        const errorData = await response.json();
        setShowWarning(false);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
  };

  return (
    <>
      <div className="message" key={message.id}>
        <div className="message_link_block">
          <span className="message_user">{message.postUserName}</span>
          <a className="message_link" onClick={() => countLikes(message)}>
            <img
              alt="img"
              className="message_image"
              id={`likeImage-${message.id}`}
              src={
                message.lastMyLikeCount === 1
                  ? "/images/heartRed.png"
                  : "/images/heart.png"
              }
            />
          </a>
          <span className="message_like_count">{message.totalLikeCount}</span>
          {message.user_id === auth.currentUser?.uid && (
            <a
              className="message_link"
              onClick={() => handleDelete(message.id)}
            >
              <img
                src="http://localhost:3000/images/cross.png"
                alt="Delete"
                className="message_image"
              />
            </a>
          )}{" "}
          {commentLink ? (
            <a
              className="message_link_detail"
              onClick={(e) => {
                e.preventDefault();
                handleTransition(message.id);
              }}
            >
              <img
                src="http://localhost:3000/images/detail.png"
                alt="img"
                className="message_image"
              />
            </a>
          ) : null}
        </div>
        <div className="message_text">{message.inputValue}</div>
      </div>
      <style jsx>
        {`
          .message {
            width: 100%;
            height: 15vh;
            background-color: #000;
            border-top: 1px solid #fff;
            border-bottom: 1px solid #fff;
            border-left: 1.3px solid #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .message_user {
            margin-top: -0.7vh;
          }
          .message_link_block {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-left: 2%;
          }
          .message_link {
            width: 3%;
            height: auto;
            margin-left: 2%;
          }
          .message_link_detail {
            width: 4%;
            height: auto;
            margin-left: 8%;
          }
          .message_image {
            width: 100%;
            height: auto;
          }
          .message_like_count {
            margin-left: 2%;
            margin-top: -0.7vh;
          }
          .message_text {
            width: 97%;
            margin: 1vh 0% 0vh 2%;
            font-size: 14px;
            white-space: normal; /*  normal（自動改行） */
            overflow-wrap: break-word; /* 長い単語やURLを枠内で折り返す */
            word-break: break-word; /* 古いブラウザ向けの互換性 */
          }
        `}
      </style>
    </>
  );
};

export default Message;
