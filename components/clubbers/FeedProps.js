"use client";
import Image from "next/image";
import React from "react";

const FeedProps = (props) => {
  return (
    <div>
      <div className="mx-auto h-[600px]  w-[500px] ">
        <div className="flex flex-row gap-4 mb-4 pl-2">
          <Image
            src={props.profilepicture}
            alt={`${props.profilename}'s profile`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <h1 className="text-white text-xl font-bold">{props.profilename}</h1>
        </div>
        <div className="relative h-[550px] w-[500px] overflow-hidden rounded-md border border-stone-800">
          <Image
            src={props.feedphoto}
            alt={`${props.profilename}'s nightlife post`}
            fill
            sizes="500px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default FeedProps;
//{props.feedphoto}
