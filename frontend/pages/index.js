import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Message from "../components/message";
import { auth } from "./firebase";
import { useUser, UserProvider } from "./userContext";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { useForm } from "react-hook-form";

const Home = () => {
  const loginUserName = useUser();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [userName, setUserName] = useState("");
  const commentLinkOnMessage = true;
  const cautionMessageOnSidebar = true;
  const sideBarTextBox = true;
  const user = useUser();
  const [rerender, setRerender] = useState(0);
  const [displayLikes, setDisplayLikes] = useState([]);
  const [saveDb, setSaveDb] = useState(0);
  const [likes, setLikes] = useState(null);
  const [arrayOfTargetMessages, setArrayOfTargetMessages] = useState([]);
  const [renderingOn, setRenderingOn] = useState(false);
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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

  //--------------------------------------------------
  const handleRemoveMessage = (id) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id)
    );
    deleteStorageRecordById(id);
    setIsLoading(false);
    setShowWarning(false);
  };
  //---------------------------------------------------
  const deleteStorageRecordById = (idNO) => {
    const data = localStorage.getItem("storedMessages");
    if (data) {
      let records = JSON.parse(data);
      records = records.filter((record) => record.id !== idNO);
      localStorage.setItem("storedMessages", JSON.stringify(records));
    } else {
      console.log("データが見つかりませんでした");
    }
  };
  //-------------------------------------------------
  const addStorageRecord = (newRecord) => {
    const data = localStorage.getItem("storedMessages");
    const records = JSON.parse(data);
    records.push(newRecord);
    localStorage.setItem("storedMessages", JSON.stringify(records));
    console.log(`新しいレコードが追加されました: ${JSON.stringify(newRecord)}`);
  };

  //-------------------------------------------
  const id = null;
  const handleRerender = (id) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id)
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

  //----------------------------------------------------------
  const handleTransition = async (id) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setShowWarning(true);
    try {
      localStorage.setItem("storedMessages", JSON.stringify(messages));

      router.push(`/comment?id=${id}`);
    } catch (error) {
      console.error("エラーが発生しました:", error);
      return;
    } finally {
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
  };

  //-----------------------------------------------------
  useEffect(() => {
    const getPosts = async (e) => {
      setIsLoading(true);
      const storedMessages = localStorage.getItem("storedMessages");
      if (storedMessages) {
        const messagesArray = JSON.parse(storedMessages);
        setMessages(messagesArray);
      }
      setIsLoading(false);
    };

    getPosts();
  }, []);

  //------------------------------------------
  const parentHandleSubmit = async (data) => {
    if (isLoading) {
      return;
    }
    
    const { inputValue } = data;
    if (!inputValue) {
      return;
    }
    setShowWarning(true);
    setIsLoading(true);
    const maxId =
      messages.length > 0 ? Math.max(...messages.map((msg) => msg.id)) : 0;

    const newMessage = {
      inputValue: inputValue,
      id: maxId + 1,
      returnPostId: null,
      postUserName: auth.currentUser?.displayName,
      user_id: auth.currentUser.uid,
      totalLikeCount: 0,
      firstMyLikeCount: 0,
      lastMyLikeCount: 0,
      isLikeClicked: false,
    };
    setMessages([newMessage, ...messages]);
    setInputValue("");
    reset();

    try {
      const response = await fetch("http://localhost/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: auth.currentUser.uid,
          message: newMessage.inputValue,
          totalLikeCount: 0,
          firstMyLikeCount: 0,
          lastMyLikeCount: 0,
          isLikeClicked: false,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("成功:", data);
        newMessage.returnPostId = data.post_id;
        console.log("newMessage:", newMessage);

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === newMessage.id
              ? {
                  ...message,
                  id: data.post_id,
                  returnPostId: data.post_id,
                  postUserName: auth.currentUser?.displayName,
                }
              : message
          )
        );

        addStorageRecord(newMessage);
        setInputValue("");
      } else {
        const errorData = await response.json();
        console.error("エラー:", errorData);
      }
      setInputValue("");
      setIsLoading(false);
      setShowWarning(false);
    } catch (error) {
      console.error("Error registering message:", error);
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
  };
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
  //-------------------------------------------------------------
  return (
    <>
      <UserProvider>
        <div className="index">
          <Sidebar
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            parentHandleSubmit={handleSubmit(parentHandleSubmit)}
            inputValue={inputValue}
            onChange={handleChange}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            showWarning={showWarning}
            setShowWarning={setShowWarning}
            cautionMessage={cautionMessageOnSidebar}
            sideBarTextBox={sideBarTextBox}
            saveDb={saveDb}
            messages={messages}
          />
          <div className="index_message_block">
            <div className="index_title">ホーム</div>
            {messages.map((message, index) => (
              <div className="message" key={message.id}>
                <Message
                  messages={messages}
                  message={message}
                  setMessage={setMessage}
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
                  saveDb={saveDb}
                  likes={likes}
                  setLikes={setLikes}
                  setSaveDb={setSaveDb}
                  arrayOfTargetMessages={arrayOfTargetMessages}
                  setArrayOfTargetMessages={setArrayOfTargetMessages}
                  countLikes={countLikes}
                  renderingOn={renderingOn}
                  setRenderingOn={setRenderingOn}
                  handleTransition={handleTransition}
                />
              </div>
            ))}
          </div>
        </div>
      </UserProvider>
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
          flex: 1; /* 利用可能な残りの幅をすべて使う */
          min-width: 0; /* 重要：中身が長くても親を突き破らないようにする */
          padding: 1vh 0% 0vh 0%;
          color: #fff;
        }
      `}</style>
    </>
  );
};
export default Home;
