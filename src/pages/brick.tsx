import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>BRICK PHONE BURN</title>
        <meta
          name="description"
          content="BRICK PHONE BURN"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Basics;
