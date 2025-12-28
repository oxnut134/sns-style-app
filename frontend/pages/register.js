import { useState, useEffect } from "react";
import { auth } from "./firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Header from "../components/header";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form"; //

export default function Register() {
  const {
    //
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const handleRegister = async (data) => {
    if (isLoading) return; 
    setError("");
    setIsLoading(true);
    setShowMessage(true);
    try {
      const { username, email, password } = data; //
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username, 
      });

      const uid = user.uid;
      console.log(uid);

      const response = await fetch("http://localhost/api/register/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          name: username,
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        alert("ユーザー登録に失敗しました。");
      }

      router.push("/login");
    } catch (error) {
      console.error("Firebase Error:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        alert("このメールアドレスは既に登録されています。");
      } else {
        alert("登録に失敗しました: " + error.message);
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setShowMessage(false);
    }
  };

  return (
    <>
      <div>
        <Header />
      </div>
      <div className="register">
        <form
          className="register_input_block"
          onSubmit={handleSubmit(handleRegister)} //
          noValidate
        >
          <div className="register_input_wrapper">
            <div className="register_input_block_title">新規登録</div>
            <input
              {...register("username", {
                //
                required: "ユーザーネームを入力してください",
                maxLength: {
                  value: 20,
                  message: "20文字以内で入力してください",
                },
              })}
              type="text"
              className="register_input"
              placeholder="ユーザーネーム"
            />
            {errors.username && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.username.message}
              </span>
            )}
            <input
              {...register("email", {
                required: "メールアドレスを入力してください",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "有効なメールアドレスの形式で入力してください",
                },
              })}
              type="email"
              className="register_input"
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
                minLength: { value: 6, message: "6文字以上で入力してください" },
              })}
              type="password"
              className="register_input"
              placeholder="パスワード"
            />
            {errors.password && (
              <span style={{ color: "red", fontSize: "12px" }}>
                {errors.password.message}
              </span>
            )}
            <button
              type="submit"
              className="register_button"
            >
              新規登録
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
                登録処理中です。しばらくお待ちください。
              </div>
            )}{" "}
            {error && <div className="error_message">{error}</div>}{" "}
          </div>
        </form>
      </div>
      <style jsx>
        {`
          .register {
            width: 100%;
            height: 90vh;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .register_input_block {
            width: 40%;
            height: 55vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff;
            border-radius: 5px;
          }
          .register_input_wrapper {
            width: 90%;
            height: 55vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .register_input_block_title {
            margin: 0% 0% 0% 0%;
            font-size:20px;
            font-weight:bold;
          }
          .register_input {
            width: 85%;
            height: 7vh;
            margin: 4% 0% 0% 0%;
            padding-left:2%;
            border: 2px solid #000;
            border-radius: 10px;
            font-size:17px;
          }
          .register_button {
            width: 27%;
            height: 7vh;
            margin: 4% 0% 0% 0%;
            border: 2px solid #000;
            border-radius: 30px;
            background-color: #2d1792ff;
            color: #fff;
            font-size:15px;
          }
          .error_message {
            margin-top: 10px;
            margin-bottom: 10px;
            color: red;
            font-size: 12px;
          }
        `}
      </style>
    </>
  );
}
