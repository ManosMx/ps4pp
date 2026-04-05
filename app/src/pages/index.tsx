import dynamic from "next/dynamic";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
// @ts-expect-error -- TODO: fix this
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import PageContent from "@/components/PageContent";
import { getServerSessionWithRole } from "@/lib/auth/server";
import { useEffect, useState } from "react";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});

function useHash() {
  const [hash, setHash] = useState("map");

  useEffect(() => {
    const update = () => {
      const h = window.location.hash.replace(/^#/, "");
      setHash(h || "map");
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return hash;
}

export default function Home({
  showMyPosts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const hash = useHash();

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar activeHash={hash} showMyPosts={showMyPosts} />
      {hash === "map" ? <Map /> : <PageContent slug={hash} />}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  showMyPosts: boolean;
}> = async (context) => {
  const { supabase, user, role } = await getServerSessionWithRole(context);
  const { data } = await supabase
    .from("feature_flags")
    .select("usersEnabled")
    .eq("id", true)
    .maybeSingle();

  return {
    props: {
      showMyPosts: Boolean(user && data?.usersEnabled && role === "USER"),
    },
  };
};
