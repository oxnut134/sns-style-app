import { UserProvider } from "./userContext";

function MyApp({ Component, pageProps }) {
  const getPage = Component.getPage || ((page) => page);
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
export default MyApp;
