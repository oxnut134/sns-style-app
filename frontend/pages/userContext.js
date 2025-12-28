import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // authオブジェクトをインポート

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loginUserName, setLoginUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("ユーザーがログインしています:", user);
        setLoginUserName(user.displayName); // ユーザー名をステートに設定
      } else {
        console.log("ユーザーはログアウトしています");
        setLoginUserName(""); // ログアウト時にユーザー名をクリア
      }
    });

    return () => unsubscribe(); // クリーンアップ関数
  }, []);

  return (
    <UserContext.Provider value={ loginUserName }>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext); // コンテキストを利用するカスタムフック
};
