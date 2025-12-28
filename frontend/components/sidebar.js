import React from "react";
import { useRouter } from "next/router";
import { auth } from "../pages/firebase";
import { useForm } from "react-hook-form"; //

const Sidebar = ({
  register,
  handleSubmit,
  errors,
  inputValue,
  onChange,
  parentHandleSubmit,
  cautionMessage,
  sideBarTextBox,
  isLoading,
  setIsLoading,
  showWarning,
  setShowWarning,
  messages,
}) => {
  const router = useRouter();
  const transitionHome = async (id) => {
    if (isLoading) {
      setIsLoading(false);
      setShowWarning(false);
      return;
    }
    setIsLoading(true);
    setShowWarning(true);

    const tempMessages = JSON.parse(localStorage.getItem("storedMessages"));
    const [element] = messages;
    const targetId = element.id;
    const matchingElementIndex = tempMessages.findIndex(
      (tempMessage) => tempMessage.id === targetId
    );
    if (matchingElementIndex !== -1) {
      tempMessages[matchingElementIndex] = element;
      console.log(
        "messageが置き換えられました:",
        tempMessages[matchingElementIndex]
      );
    } else {
      console.log("一致する要素は見つかりませんでした。");
    }
    localStorage.setItem("storedMessages", JSON.stringify(tempMessages));

    router.push("/");

    setIsLoading(false);
    setShowWarning(false);

    return;
  };
  //--------------------------------------------------------------
  const saveLikesToDb = async (id) => {
    try {
      const targetMessages = messages.filter((m) => m.isLikeClicked);

      if (targetMessages.length === 0) return;

      const response = await fetch("http://localhost/api/sync/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: auth.currentUser.uid,
          messages: targetMessages,
        }),
      });

      if (response.ok) {
        console.log("いいねの一括同期に成功しました");
      }
    } catch (error) {
      console.error("保存エラー:", error);
    }
    
  };

  //----------------------------------------------------------
  const handleLogout = async (id) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setShowWarning(true);
    await new Promise((resolve) => setTimeout(resolve, 10));

    await saveLikesToDb();
    await savePosts();

    setIsLoading(false);
    setShowWarning(false);

    logout();
  };

  const savePosts = async (id) => {
    try {
      const response = await fetch("http://localhost/api/save/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("成功:", data);
      } else {
        const errorData = await response.json();
        console.error("エラー:", errorData);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      return;
    } finally {
      return;
    }
  };

  //-----------------------------------------------------
  const logout = async () => {
    try {
      await auth.signOut();
      console.log("ログアウト成功");
      router.replace("/login");

    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };
  return (
    <>
      <div className="sidebar">
        <img
          src="http://localhost:3000/images/logo.png"
          alt="Logo"
          className="sidebar_logo"
        />
        <a className="sidebar_link_block" onClick={transitionHome}>
          <img
            src="http://localhost:3000/images/home.png"
            alt="Logo"
            className="sidebar_link_icon"
          />
          <span className="sidebar_link_text">ホーム</span>
        </a>
        <a className="sidebar_link_block" onClick={handleLogout}>
          <img
            src="http://localhost:3000/images/logout.png"
            alt="Logo"
            className="sidebar_link_icon"
          />
          <span className="sidebar_link_text">ログアウト</span>
        </a>
        <form onSubmit={parentHandleSubmit}>
          <div className="sidebar_textarea">
            <div className="sidebar_textarea_title">シェア</div>
            <textarea
              {...register("inputValue", {
                maxLength: {
                  value: 120,
                  message: "120文字以内で入力してください",
                },
              })}
              className="sidebar_textarea_input"
              type="text"
              value={inputValue}
              onChange={onChange}
              disabled={!sideBarTextBox}

            />
            {errors.inputValue && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.inputValue.message}
              </span>
            )}
          </div>
          <div className="sidebar_button_block">
            {sideBarTextBox ? (
              <button
                type="submit"
                className="sidebar_share_button"
                disabled={isLoading}
              >
                シェアする
              </button>
            ) : (
              <button
                type="submit"
                className="sidebar_share_button"
                disabled={true}
              >
                シェアする
              </button>
            )}
          </div>
        </form>
        {showWarning && cautionMessage && (
          <div style={{ marginLeft: "2%", color: "red", fontSize: "12px" }}>
            処理中です！この表示が消えたら操作してください。
          </div>
        )}
      </div>
      <style jsx>
        {`
          a {
            text-decoration: none;
          }
          .sidebar {
            width: 20%;
            min-height: 100vh;
            height:auto;
            background-color: #000;
            display: flex;
            flex-direction: column;
            font-size: 15px;
            color: #fff;
            border-right: 1.7px solid #fff;
            margin-right: -1px;
             align-self: stretch;
          }
          .sidebar_logo {
            width: 50%;
            height: auto;
            margin: 3vh 0% 1vh 10%;
          }
          .sidebar_link_block {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin: 0vh 0% 0vh 0%;
            cursor: pointer;
          }
          .sidebar_link_icon {
            width: 12%;
            height: auto;
            margin: 1vh 0% 0vh 8%;
          }
          .sidebar_link_text {
            margin: 2vh 5% 1.5vh 7%;
            text-decoration: none;
            color: #fff;
          }
          .sidebar_textarea {
            margin: 3vh 0% 1vh 8%;
            display:flex;
            flex-direction:column;
          }
          .sidebar_textarea_title {
            margin: 0vh 0% 2vh 0%;
          }
          .sidebar_textarea_input {
            width: 90%;
            height: 22vh;
            border: 1px solid #fff;
            border-radius: 5px;
            background-color: #000;
            color: #fff;
          }
          .sidebar_button_block {
            height: 6vh;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin: 2vh;
          }
          .sidebar_share_button {
            width: 50%;
            height: 100%;
            margin: 0% 0% 0% 0%;
            border-radius: 30px;
            background-color: #2d1792ff;
            color: #fff;
            box-shadow: -2px -2px 5px #888;
            font-size: 12px;
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;
