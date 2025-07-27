"use client";
import React from "react";

function FirstDiv() {
  return (
    <div>
      <div className="fixed flex flex-col gap-10 pl-28 pr-24 border-r-[1px] border-stone-800 h-[100vh] ">
        <div className="pt-20 text-white italic font-black">
          <h1>SCENEMATES</h1>
        </div>
        <div>
          <h1 className="text-white">Home</h1>
        </div>
        <div>
          <h1 className="text-white">Conversation</h1>
        </div>
        <div>
          <h1 className="text-white">Groups</h1>
        </div>
      </div>
    </div>
  );
}

export default FirstDiv;
