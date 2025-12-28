export default function Header(props) {
  return (
    <>
      <div className="header">
        {/*<h1 className="h4 bg-secondary text-white p-2">{props.appname}</h1>*/}
        <img
          src="http://localhost:3000/images/logo.png"
          alt="Logo"
          className="header_logo"
        />
        <span className="header_link_parts">
          <a href="http://localhost:3000/register" className="header_link">
            新規登録
          </a>
          <a href="http://localhost:3000/login" className="header_link">
            ログイン
          </a>
        </span>
      </div>
      <style jsx>
        {`
          .header {
            width: 100%;
            height: 10vh;
            background-color: #000;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header_logo {
            width: 13%;
            //height: 6vh;
            margin-top:5vh;
            margin-left:2%;
          }
          .header_link_parts {
            width: 20%;
            height: 100%;
            display: flex;
            align-items: flex-end;
          }
          .header_link {
            margin: 1vh 5%;
            color: #fff;
            font-size:17px;
            text-decoration: none;
          }
        `}
      </style>
    </>
  );
}
