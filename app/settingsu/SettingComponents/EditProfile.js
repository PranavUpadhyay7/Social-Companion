"use client";
import React from "react";
import { useState } from "react";
import { XMarkIcon, HomeIcon } from "@heroicons/react/24/outline";

const EditProfile = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black/50">
      <div className="relative flex flex-col items-center justify-center h-[70vh] w-[35vw] bg-zinc-900">
        <XMarkIcon className="h-6 w-6 text-white absolute top-4 right-4 cursor-pointer" />

        <div className="text-white font-bold text-center mb-4">
          Profile Picture
        </div>
        <form
          onSubmit={null}
          className="flex flex-col gap-2 w-[30vw] mx-auto p-6  rounded-lg"
        >
          <h1 className="text-white font-semibold text-base">Bio</h1>
          <input
            type="text"
            name="bio"
            placeholder=""
            onChange={null}
            className="border bg-zinc-900 text-white text-sm hover:bg-zinc-800 border-gray-500  p-3 mb-6 rounded-lg 
             focus:outline-none focus:ring-[1px] focus:ring-[#7F00FF] 
             focus:border-[#7F00FF] transition-all duration-200  "
          />
          <h1 className="text-white font-semibold">Gender</h1>
          <input
            type=""
            name=""
            placeholder=""
            onChange={null}
            className="border bg-zinc-900 text-white hover:bg-zinc-800 p-3 mb-6 border-gray-500 rounded-lg 
             focus:outline-none focus:ring-[1px] focus:ring-[#7F00FF] 
             focus:border-[#7F00FF] transition-all duration-200"
          />
          <button
            type="submit"
            className="text-white bg-[#7F00FF] px-3 py-4 rounded-lg"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
