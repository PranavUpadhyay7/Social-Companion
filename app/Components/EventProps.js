import React from "react";
import eventcard from "/public/eventcard";

function EventProps(props) {
  return (
    <div>
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl hover:shadow-[0_0_20px_#39ff1480] transition-shadow duration-200">
        <img
          src={props.image}
          className="w-full h-96 object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold mb-1">{props.title}</h3>
        <p className="text-gray-400 text-sm mb-3">{props.venue}</p>
        <button className="px-6 py-2 bg-black text-white font-bold rounded-xl hover:bg-[#c83349]">
          {props.buttontext}
        </button>
      </div>
    </div>
  );
}

export default EventProps;
//bg-[#39ff14]
