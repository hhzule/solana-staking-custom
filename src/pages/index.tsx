import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";
import { SelectToken } from '../components/SelectToken';
const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>TOKEN BURN</title>
        <meta
          name="description"
          content="TOKEN BURN"
        />
      </Head>
      {/* <HomeView /> */}
      <SelectToken/>
    </div>
  );
};

export default Home;
