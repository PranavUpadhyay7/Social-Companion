"use client";
import React from "react";
import feedCards from "@/data/feedCards";
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
  return <div className="flex flex-col gap-20">{feedCards.map(feedmap)}</div>;
};

export default FeedMap;
