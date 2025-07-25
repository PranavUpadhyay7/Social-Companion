"use client";
import React from "react";
import feedcard from "@/public/feedcard";
import FeedProps from "./FeedProps";

function feedmap(feedobject) {
  return (
    <FeedProps
      key={feedobject.id}
      profilepicture={feedobject.pi}
      profilename={feedobject.pn}
      feedphoto={feedobject.fp}
    />
  );
}
const FeedMap = () => {
  return <div className="flex flex-col gap-20">{feedcard.map(feedmap)}</div>;
};

export default FeedMap;
