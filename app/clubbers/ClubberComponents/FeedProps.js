"use client";
import React from "react";

const FeedProps = (props) => {
  return (
    <div>
      <div className="mx-auto h-[600px]  w-[500px] ">
        <div className="flex flex-row gap-4 mb-4 pl-2">
          <img src={props.profilepicture} className="h-10 w-10 rounded-full" />
          <h1 className="text-white text-xl font-bold">{props.profilename}</h1>
        </div>
        <div className=" h-[550px] w-[500px] border-[1px]  border-stone-800 rounded-md ">
          <img
            src={props.feedphoto}
            className="w-full h-full object-cover border-[1px]  border-stone-800 rounded-md "
          />
        </div>
      </div>
    </div>
  );
};

export default FeedProps;
//{props.feedphoto}
