import dynamic from "next/dynamic";
// @ts-expect-error -- TODO: fix this
import "leaflet/dist/leaflet.css";

const NewPostMap = dynamic(() => import("@/components/NewPostMap"), {
  ssr: false,
});

export default function NewPost() {
  return <NewPostMap />;
}
